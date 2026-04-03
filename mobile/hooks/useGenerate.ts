import { useState, useCallback, useRef } from "react";
import { api } from "../services/api";
import { prepareImage, validateImageSize } from "../services/imageUtils";
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

  const generate = useCallback(async (
    imageUri: string,
    customPrompt?: string,
    selectedStyleIds?: string[]
  ) => {
    abortRef.current = false;
    setError(null);

    const stylesToGenerate =
      selectedStyleIds && selectedStyleIds.length > 0
        ? STYLES.filter((s) => selectedStyleIds.includes(s.id))
        : STYLES;

    setResults(stylesToGenerate.map((s) => ({ styleId: s.id, status: "loading" })));
    setStatus("preparing");

    let base64: string;
    try {
      base64 = await prepareImage(imageUri);
    } catch (e: any) {
      setError(`Failed to process image: ${e.message || "Unknown error"}.`);
      setStatus("error");
      return;
    }

    const sizeValidation = validateImageSize(base64);
    if (!sizeValidation.valid) {
      setError(sizeValidation.error || "Image validation failed");
      setStatus("error");
      return;
    }

    if (abortRef.current) return;

    const stylesToSend = stylesToGenerate.map(s => s.id) as StyleId[];
    setStatus("generating");

    try {
      const { results: batchResults } = await api.generateBatch(base64, stylesToSend, customPrompt);
      console.log("🎨 API response received:", JSON.stringify(batchResults, null, 2));

      if (abortRef.current) return;

      for (const result of batchResults) {
        console.log(`📦 Processing ${result.styleId}:`, {
          success: result.success,
          hasUrl: !!result.url,
          error: result.error,
          urlLength: result.url?.length,
        });
        if (result.success && result.url) {
          console.log(`✅ Setting success for ${result.styleId}`);
          updateResult(result.styleId as StyleId, { status: "success", url: result.url });
        } else {
          console.log(`❌ Setting error for ${result.styleId}: ${result.error}`);
          updateResult(result.styleId as StyleId, { status: "error", error: result.error });
        }
      }
      setStatus("done");
    } catch (e: any) {
      if (abortRef.current) return;
      console.error("💥 API Error:", e);
      setError(e.message || "Generation failed. Please try again.");
      setStatus("error");
      setResults((prev) =>
        prev.map((r) => (r.status === "loading" ? { ...r, status: "error" } : r))
      );
    }
  }, [updateResult]);

  const retry = useCallback(async (
    imageUri: string,
    styleId: StyleId,
    customPrompt?: string
  ) => {
    updateResult(styleId, { status: "loading", error: undefined });
    try {
      const base64 = await prepareImage(imageUri);
      const sizeValidation = validateImageSize(base64);
      if (!sizeValidation.valid) {
        updateResult(styleId, { status: "error", error: sizeValidation.error });
        return;
      }
      const result = await api.generateSingle(base64, styleId, customPrompt);
      if (result.success && result.url) {
        updateResult(styleId, { status: "success", url: result.url });
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