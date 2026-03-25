// ⚠️ Replace with your deployed Render backend URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3001";

export const STYLES = [
  { id: "cartoon", label: "Cartoon", emoji: "🎨", color: "#F59E0B" },
  { id: "flat",    label: "Flat Art", emoji: "🖼️", color: "#10B981" },
  { id: "anime",   label: "Anime",   emoji: "✨", color: "#EC4899" },
  { id: "pixel",   label: "Pixel Art",emoji: "👾", color: "#3B82F6" },
  { id: "sketch",  label: "Sketch",  emoji: "✏️", color: "#8B5CF6" },
] as const;

export type StyleId = typeof STYLES[number]["id"];

export const MAX_IMAGE_DIMENSION = 1024;
export const IMAGE_QUALITY = 0.85;
export const CACHE_KEY_PREFIX = "clipart_cache_";
