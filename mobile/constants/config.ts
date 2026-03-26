// ⚠️ Update this with your computer's IP address when testing on physical device
// Find your IP: Windows: ipconfig | Mac/Linux: ifconfig
// For emulator: use http://10.0.2.2:3001
// For physical device: use http://YOUR_COMPUTER_IP:3001
// For production: use your Render URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.100:3001";

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
