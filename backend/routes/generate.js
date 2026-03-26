const express = require("express");
const Replicate = require("replicate");
const { generateLimiter } = require("../middleware/rateLimit");
const { STYLES } = require("../constants/styles");

const router = express.Router();

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// Validate base64 image - returns { valid: boolean, raw?: string, error?: string }
function validateImage(base64) {
  if (!base64 || typeof base64 !== "string") {
    return { valid: false, error: "Missing image data" };
  }
  
  // Strip data URI prefix if present
  const raw = base64.replace(/^data:image\/\w+;base64,/, "");
  
  if (raw.length < 100) {
    return { valid: false, error: "Image data too small (corrupted or invalid)" };
  }
  
  // Increased from 6MB to 15MB base64 (handles up to ~11MB decoded images)
  if (raw.length > 15_000_000) {
    const sizeMB = (raw.length / 1_000_000).toFixed(1);
    return { valid: false, error: `Image too large (${sizeMB}MB base64). Please use an image under 10MB.` };
  }
  
  // Basic base64 validation
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(raw)) {
    return { valid: false, error: "Invalid base64 encoding" };
  }
  
  return { valid: true, raw };
}

// Run a single style generation
async function runGeneration(styleId, imageDataUri, customPrompt) {
  const style = STYLES[styleId];
  if (!style) throw new Error(`Unknown style: ${styleId}`);

  const prompt = customPrompt
    ? `${customPrompt}, ${style.prompt}`
    : style.prompt;

  try {
    // Models that support image-to-image
    let input = {};

    if (styleId === "cartoon" || styleId === "anime") {
      input = {
        prompt,
        input_image: imageDataUri,
        negative_prompt: style.negativePrompt,
        num_outputs: 1,
        style_strength_ratio: style.strength * 100,
      };
    } else if (styleId === "pixel") {
      input = {
        image: imageDataUri,
      };
    } else if (styleId === "sketch") {
      input = {
        image: imageDataUri,
        prompt,
        num_samples: 1,
        image_resolution: "512",
      };
    } else {
      // Flat illustration - text-to-image with SDXL
      input = {
        prompt,
        negative_prompt: style.negativePrompt,
        width: 768,
        height: 768,
        num_outputs: 1,
      };
    }

    const output = await replicate.run(style.model, { input });
    const resultUrl = Array.isArray(output) ? output[0] : output;
    return { styleId, success: true, url: resultUrl };
  } catch (err) {
    console.error(`[GENERATE] Style ${styleId} failed:`, err.message);
    return { styleId, success: false, error: err.message };
  }
}

// POST /api/generate/single — generate one style
router.post("/single", generateLimiter, async (req, res, next) => {
  try {
    const { image, styleId, customPrompt } = req.body;

    const validation = validateImage(image);
    if (!validation.valid) {
      console.log(`[UPLOAD ERROR] ${validation.error}`);
      return res.status(400).json({ error: validation.error });
    }
    if (!STYLES[styleId]) {
      return res.status(400).json({ error: "Invalid style ID." });
    }

    const imageDataUri = image.startsWith("data:")
      ? image
      : `data:image/jpeg;base64,${validation.raw}`;

    console.log(`[UPLOAD] Single style: ${styleId}, size: ${(validation.raw.length / 1_000_000).toFixed(2)}MB`);
    const result = await runGeneration(styleId, imageDataUri, customPrompt);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/generate/batch — generate all styles in parallel
router.post("/batch", generateLimiter, async (req, res, next) => {
  try {
    const { image, styles, customPrompt } = req.body;

    const validation = validateImage(image);
    if (!validation.valid) {
      console.log(`[UPLOAD ERROR] ${validation.error}`);
      return res.status(400).json({ error: validation.error });
    }

    const requestedStyles = styles && Array.isArray(styles)
      ? styles.filter((s) => STYLES[s])
      : Object.keys(STYLES);

    if (requestedStyles.length === 0) {
      return res.status(400).json({ error: "No valid styles requested." });
    }

    const imageDataUri = image.startsWith("data:")
      ? image
      : `data:image/jpeg;base64,${validation.raw}`;

    console.log(`[UPLOAD] Batch generation: ${requestedStyles.length} styles, size: ${(validation.raw.length / 1_000_000).toFixed(2)}MB`);
    
    // Fire all in parallel
    const results = await Promise.allSettled(
      requestedStyles.map((styleId) =>
        runGeneration(styleId, imageDataUri, customPrompt)
      )
    );

    const formatted = results.map((r, i) => {
      if (r.status === "fulfilled") return r.value;
      return { styleId: requestedStyles[i], success: false, error: r.reason?.message };
    });

    res.json({ results: formatted });
  } catch (err) {
    next(err);
  }
});

// GET /api/generate/styles — list available styles
router.get("/styles", (req, res) => {
  res.json({ styles: Object.values(STYLES).map(({ id, label, emoji }) => ({ id, label, emoji })) });
});

module.exports = router;
