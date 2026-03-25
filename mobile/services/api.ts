import { API_BASE_URL, StyleId } from "../constants/config";

export interface GenerateResult {
  styleId: StyleId;
  success: boolean;
  url?: string;
  error?: string;
}

export interface BatchResult {
  results: GenerateResult[];
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  async generateBatch(
    imageBase64: string,
    styles?: StyleId[],
    customPrompt?: string
  ): Promise<BatchResult> {
    const res = await fetch(`${API_BASE_URL}/api/generate/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imageBase64,
        styles,
        customPrompt: customPrompt?.trim() || undefined,
      }),
    });
    return handleResponse<BatchResult>(res);
  },

  async generateSingle(
    imageBase64: string,
    styleId: StyleId,
    customPrompt?: string
  ): Promise<GenerateResult> {
    const res = await fetch(`${API_BASE_URL}/api/generate/single`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imageBase64,
        styleId,
        customPrompt: customPrompt?.trim() || undefined,
      }),
    });
    return handleResponse<GenerateResult>(res);
  },

  async getStyles() {
    const res = await fetch(`${API_BASE_URL}/api/generate/styles`);
    return handleResponse<{ styles: { id: StyleId; label: string; emoji: string }[] }>(res);
  },
};
