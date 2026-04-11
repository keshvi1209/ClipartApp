import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MAX_IMAGE_DIMENSION, IMAGE_QUALITY, CACHE_KEY_PREFIX } from "../constants/config";
import CryptoJS from "crypto-js";

export async function prepareImage(uri: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_IMAGE_DIMENSION, height: MAX_IMAGE_DIMENSION } }],
    { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  
  const base64Str = manipulated.base64 || '';
  if (base64Str.startsWith('data:image')) {
    return base64Str;
  }
  return `data:image/jpeg;base64,${base64Str}`;
}

// Validate image size before upload
export function validateImageSize(base64DataUri: string): { valid: boolean; error?: string; sizeMB?: number } {
  // Strip data URI prefix to get raw base64
  const raw = base64DataUri.replace(/^data:image\/\w+;base64,/, "");
  const sizeMB = raw.length / 1_000_000;
  
  // Backend accepts up to 15MB base64 (~11MB decoded)
  if (sizeMB > 15) {
    return { 
      valid: false, 
      error: `Image too large (${sizeMB.toFixed(1)}MB). Please use a smaller image or lower quality photo.`,
      sizeMB 
    };
  }
  
  if (raw.length < 100) {
    return { valid: false, error: "Image data corrupted or too small", sizeMB };
  }
  
  return { valid: true, sizeMB };
}

// Hash image base64 for cache key
export function hashImage(base64: string): string {
  return CryptoJS.MD5(base64.slice(0, 500)).toString();
}

// Cache results by image hash + style combo
export async function getCachedResult(imageHash: string, styleId: string): Promise<string | null> {
  try {
    const key = `${CACHE_KEY_PREFIX}${imageHash}_${styleId}`;
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setCachedResult(imageHash: string, styleId: string, url: string) {
  try {
    const key = `${CACHE_KEY_PREFIX}${imageHash}_${styleId}`;
    await AsyncStorage.setItem(key, url);
  } catch {}
}

// Download image to device
export async function downloadImage(url: string, filename: string): Promise<string> {
  const fileUri = FileSystem.documentDirectory + filename;
  const { uri } = await FileSystem.downloadAsync(url, fileUri);
  return uri;
}
