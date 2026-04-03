const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const { generateLimiter } = require("../middleware/rateLimit");
const { STYLES } = require("../constants/styles");

const router = express.Router();

const API_URL =
  "https://api.stability.ai/v2beta/stable-image/generate/sd3";

const API_KEY = process.env.STABILITY_API_KEY;

// ---------------- IMAGE VALIDATION ----------------

function validateImage(base64) {
  if (!base64 || typeof base64 !== "string") {
    return { valid: false, error: "Missing image data" };
  }

  const raw = base64.replace(/^data:image\/\w+;base64,/, "");

  if (raw.length < 100) {
    return { valid: false, error: "Image too small" };
  }

  if (raw.length > 15_000_000) {
    return { valid: false, error: "Image too large (max 10MB)" };
  }

  return { valid: true, raw };
}

// ---------------- GENERATION ----------------

async function runGeneration(styleId, imageDataUri, customPrompt) {
  const style = STYLES[styleId];
  if (!style) throw new Error("Unknown style");

  const prompt = customPrompt
    ? `${customPrompt}, ${style.prompt}`
    : style.prompt;

  try {
    const base64 = imageDataUri.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    const form = new FormData();

    form.append("prompt", prompt);
    form.append("mode", "image-to-image");
    form.append("strength", style.strength || 0.7);
    form.append("image", buffer, {
      filename: "input.png",
    });

    const response = await axios.post(API_URL, form, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        ...form.getHeaders(),
      },
      responseType: "arraybuffer",
    });

    const imageBase64 = Buffer.from(response.data).toString("base64");

    return {
      styleId,
      success: true,
      url: `data:image/png;base64,${imageBase64}`,
    };
  } catch (err) {
    console.error("[STABILITY ERROR]", err.response?.data || err.message);

    return {
      styleId,
      success: false,
      error: err.message,
    };
  }
}

// ---------------- SINGLE ----------------

router.post("/single", generateLimiter, async (req, res, next) => {
  try {
    const { image, styleId, customPrompt } = req.body;

    const validation = validateImage(image);

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const imageDataUri = image.startsWith("data:")
      ? image
      : `data:image/png;base64,${validation.raw}`;

    const result = await runGeneration(
      styleId,
      imageDataUri,
      customPrompt
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ---------------- BATCH ----------------

router.post("/batch", generateLimiter, async (req, res, next) => {
  try {
    const { image, styles, customPrompt } = req.body;

    const validation = validateImage(image);

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const requestedStyles =
      styles && Array.isArray(styles)
        ? styles.filter((s) => STYLES[s])
        : Object.keys(STYLES);

    const imageDataUri = image.startsWith("data:")
      ? image
      : `data:image/png;base64,${validation.raw}`;

    const results = await Promise.allSettled(
      requestedStyles.map((styleId) =>
        runGeneration(styleId, imageDataUri, customPrompt)
      )
    );

    const formatted = results.map((r, i) => {
      if (r.status === "fulfilled") return r.value;

      return {
        styleId: requestedStyles[i],
        success: false,
        error: r.reason?.message,
      };
    });

    res.json({ results: formatted });
  } catch (err) {
    next(err);
  }
});

// ---------------- STYLES ----------------

router.get("/styles", (req, res) => {
  res.json({
    styles: Object.values(STYLES).map(({ id, label, emoji }) => ({
      id,
      label,
      emoji,
    })),
  });
});

module.exports = router;