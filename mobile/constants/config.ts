// ⚠️ Update this with your computer's IP address when testing on physical device
// Find your IP: Windows: ipconfig | Mac/Linux: ifconfig
// For emulator: use http://10.0.2.2:3001
// For physical device: use http://YOUR_COMPUTER_IP:3001
// For production: use your Render URL

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.78.0.238:3001";

// Validate API URL is set
if (!API_BASE_URL) {
  console.warn(
    "[CONFIG] API_BASE_URL not configured. Set EXPO_PUBLIC_API_URL in .env or update config.ts"
  );
}

export const STYLES = [
  { id: "cartoon", label: "Cartoon", emoji: "🎨", color: "#D97706" },
  { id: "flat",    label: "Flat Art", emoji: "🖼️", color: "#059669" },
  { id: "anime",   label: "Anime",   emoji: "✨", color: "#DB2777" },
  { id: "pixel",   label: "Pixel Art",emoji: "👾", color: "#2563EB" },
  { id: "sketch",  label: "Sketch",  emoji: "✏️", color: "#6D28D9" },
] as const;

export type StyleId = typeof STYLES[number]["id"];

export const MAX_IMAGE_DIMENSION = 1024;
export const IMAGE_QUALITY = 0.85;
export const CACHE_KEY_PREFIX = "clipart_cache_";
