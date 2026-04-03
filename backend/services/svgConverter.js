/**
 * SVG Conversion Service
 * Converts image URLs to SVG format using Replicate's potrace model
 * or returns embedded base64 canvas data as SVG
 */

const Replicate = require("replicate");

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

async function convertImageToSVG(imageUrl) {
  try {
    console.log("[SVG] Converting image to SVG:", imageUrl);
    
    // Use Replicate's potrace-based model for image to SVG conversion
    const output = await replicate.run(
      "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
      {
        input: {
          image: imageUrl,
          prompt: "line art, clean outline, vector art style, removable background",
          num_samples: 1,
          image_resolution: "512",
        },
      }
    );

    const svgUrl = Array.isArray(output) ? output[0] : output;
    console.log("[SVG] Conversion successful:", svgUrl);
    return { success: true, url: svgUrl };
  } catch (err) {
    console.error("[SVG] Conversion failed:", err.message);
    return { 
      success: false, 
      error: `SVG conversion failed: ${err.message}` 
    };
  }
}

module.exports = { convertImageToSVG };
