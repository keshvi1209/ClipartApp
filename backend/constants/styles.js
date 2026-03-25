// Each style maps to a Replicate model + carefully crafted prompt
const STYLES = {
  cartoon: {
    id: "cartoon",
    label: "Cartoon",
    emoji: "🎨",
    model: "tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5e15d6a2577186ea2dbce8919",
    prompt:
      "cartoon style illustration of img, vibrant colors, bold outlines, Disney/Pixar inspired, expressive face, clean linework, cel shading, high quality",
    negativePrompt: "realistic, photo, blurry, dark, gloomy, ugly, deformed",
    strength: 0.8,
  },
  flat: {
    id: "flat",
    label: "Flat Art",
    emoji: "🖼️",
    model: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    prompt:
      "flat illustration style portrait of a person, minimal shading, geometric shapes, modern vector art, bold solid colors, clean design, Adobe Illustrator style, professional",
    negativePrompt: "3d, realistic, photographic, complex textures, noise",
    strength: 0.75,
    isImg2Img: false, // SDXL uses text prompt with face description
  },
  anime: {
    id: "anime",
    label: "Anime",
    emoji: "✨",
    model: "cjwbw/anything-v3-better-vae:09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65",
    prompt:
      "anime style portrait, img, high quality anime illustration, studio ghibli inspired, beautiful detailed eyes, smooth shading, vibrant colors, masterpiece",
    negativePrompt: "realistic, ugly, deformed, bad anatomy, low quality, blurry",
    strength: 0.75,
  },
  pixel: {
    id: "pixel",
    label: "Pixel Art",
    emoji: "👾",
    model: "andreasjansson/pixel-art-transform:6dca1aa2c19f9d4f36f83d6e77a85d9f3571eb1b92f8c70d31d5c52bc48e8044",
    prompt: "pixel art portrait, 16-bit style, retro video game character, detailed pixel face, vibrant palette",
    negativePrompt: "blurry, smooth, realistic, photo",
    strength: 0.9,
  },
  sketch: {
    id: "sketch",
    label: "Sketch",
    emoji: "✏️",
    model: "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
    prompt:
      "pencil sketch portrait, hand-drawn illustration, fine linework, cross-hatching, detailed facial features, artistic sketch, professional drawing",
    negativePrompt: "color, painted, digital art, blurry",
    strength: 0.85,
  },
};

module.exports = { STYLES };
