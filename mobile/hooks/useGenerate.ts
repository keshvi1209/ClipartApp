import { useState, useCallback, useRef } from "react";
import { api, GenerateResult } from "../services/api";
import { prepareImage, hashImage, getCachedResult, setCachedResult } from "../services/imageUtils";
import { STYLES, StyleId } from "../constants/config";

export type GenerationStatus = "idle" | "preparing" | "generating" | "done" | "error";

export interface StyleResult {
  styleId: StyleId;
  status: "pending" | "loading" | "success" | "error";
  url?: string;
  error?: string;
}

export function useGenerate() {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [results, setResults] = useState<StyleResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const updateResult = useCallback((styleId: StyleId, patch: Partial<StyleResult>) => {
    setResults((prev) =>
      prev.map((r) => (r.styleId === styleId ? { ...r, ...patch } : r))
    );
  }, []);

  const generate = useCallback(async (imageUri: string, customPrompt?: string) => {
    abortRef.current = false;
    setError(null);

    // Init all as loading
    setResults(STYLES.map((s) => ({ styleId: s.id, status: "loading" })));
    setStatus("preparing");

    let base64: string;
    try {
      base64 = await prepareImage(imageUri);
    } catch (e: any) {
      setError("Failed to process image. Try a different photo.");
      setStatus("error");
      return;
    }

    if (abortRef.current) return;

    const imageHash = hashImage(base64);

    // Check cache for each style
    const cachedResults = await Promise.all(
      STYLES.map(async (s) => {
        const cached = await getCachedResult(imageHash, s.id);
        return { styleId: s.id, cached };
      })
    );

    const uncachedStyles: StyleId[] = [];
    for (const { styleId, cached } of cachedResults) {
      if (cached) {
        updateResult(styleId, { status: "success", url: cached });
      } else {
        uncachedStyles.push(styleId);
      }
    }

    if (uncachedStyles.length === 0) {
      setStatus("done");
      return;
    }

    setStatus("generating");

    // Generate all uncached styles in parallel via batch endpoint
    try {
      const { results: batchResults } = await api.generateBatch(base64, uncachedStyles, customPrompt);

      if (abortRef.current) return;

      for (const result of batchResults) {
        if (result.success && result.url) {
          updateResult(result.styleId as StyleId, { status: "success", url: result.url });
          setCachedResult(imageHash, result.styleId, result.url);
        } else {
          updateResult(result.styleId as StyleId, { status: "error", error: result.error });
        }
      }
      setStatus("done");
    } catch (e: any) {
      if (abortRef.current) return;
      setError(e.message || "Generation failed. Please try again.");
      setStatus("error");
      // Mark all still-loading as error
      setResults((prev) =>
        prev.map((r) => (r.status === "loading" ? { ...r, status: "error" } : r))
      );
    }
  }, [updateResult]);

  // Retry a single style
  const retry = useCallback(async (imageUri: string, styleId: StyleId, customPrompt?: string) => {
    updateResult(styleId, { status: "loading", error: undefined });
    try {
      const base64 = await prepareImage(imageUri);
      const result = await api.generateSingle(base64, styleId, customPrompt);
      if (result.success && result.url) {
        updateResult(styleId, { status: "success", url: result.url });
        const hash = hashImage(base64);
        setCachedResult(hash, styleId, result.url);
      } else {
        updateResult(styleId, { status: "error", error: result.error });
      }
    } catch (e: any) {
      updateResult(styleId, { status: "error", error: e.message });
    }
  }, [updateResult]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setStatus("idle");
    setResults([]);
    setError(null);
  }, []);

  return { status, results, error, generate, retry, reset };
}
