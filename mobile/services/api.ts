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
    // Handle rate limiting
    if (res.status === 429) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Server error (${res.status})`);
  }
  return res.json();
}

// Fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection and try again.');
    }
    console.error('[API] Network error:', { url, method: options.method, error: err.message });
    throw new Error(`Failed to connect to ${url}: ${err.message}`);
  }
}

export const api = {
  async generateBatch(
    imageBase64: string,
    styles?: StyleId[],
    customPrompt?: string
  ): Promise<BatchResult> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/generate/batch`, {
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
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/generate/single`, {
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
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/generate/styles`, {});
    return handleResponse<{ styles: { id: StyleId; label: string; emoji: string }[] }>(res);
  },
};
