import { useState, useCallback, useRef } from "react";
import { api } from "../services/api";
import { prepareImage, hashImage, getCachedResult, setCachedResult, validateImageSize } from "../services/imageUtils";
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
    // 🚀 --- START OF DEBUG CONSOLE --- 🚀
    console.group(`\n🚀 [GENERATION STARTED] - ${new Date().toLocaleTimeString()}`);
    console.time("⏱️ Total Execution Time");
   

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
      console.time("⚙️ Image Prep Time");
      base64 = await prepareImage(imageUri);
      console.timeEnd("⚙️ Image Prep Time");

    } catch (e: any) {
      console.error("❌ ERROR: Image Prep Failed:", e);
      setError(`Failed to process image: ${e.message || "Unknown error"}. Try a different photo.`);
      setStatus("error");
      console.groupEnd();
      return;
    }

    const sizeValidation = validateImageSize(base64);
    if (!sizeValidation.valid) {
      console.warn("⚠️ ERROR: Size Validation Failed:", sizeValidation.error);
      setError(sizeValidation.error || "Image validation failed");
      setStatus("error");
      console.groupEnd();
      return;
    }

    if (abortRef.current) {
      console.log("🛑 4. Generation Aborted by User");
      console.groupEnd();
      return;
    }

    const imageHash = hashImage(base64);
    

    const cachedResults = await Promise.all(
      stylesToGenerate.map(async (s) => {
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
      console.timeEnd("⏱️ Total Execution Time");
      console.groupEnd();
      return;
    }

    console.log("🌐 5. Missing in Cache (Sending to API):", uncachedStyles);
    setStatus("generating");

    try {
   
      console.time("⏳ API Network Wait Time");
      
      // The actual network request
      const { results: batchResults } = await api.generateBatch(base64, uncachedStyles, customPrompt);
      
      console.timeEnd("⏳ API Network Wait Time");
   

      if (abortRef.current) {

        console.groupEnd();
        return;
      }

      for (const result of batchResults) {
        if (result.success && result.url) {
          updateResult(result.styleId as StyleId, { status: "success", url: result.url });
          setCachedResult(imageHash, result.styleId, result.url);
        } else {
          console.error(`⚠️ BACKEND ERROR for ${result.styleId}:`, result.error);
          updateResult(result.styleId as StyleId, { status: "error", error: result.error });
        }
      }
      setStatus("done");
    } catch (e: any) {
      if (abortRef.current) return;
      console.error("💥 CRITICAL NETWORK ERROR:", e);
      setError(e.message || "Generation failed. Please try again.");
      setStatus("error");
      setResults((prev) =>
        prev.map((r) => (r.status === "loading" ? { ...r, status: "error" } : r))
      );
    }
    
    console.timeEnd("⏱️ Total Execution Time");
    console.groupEnd();
    // 🚀 --- END OF DEBUG CONSOLE --- 🚀

  }, [updateResult]);

  const retry = useCallback(async (
    imageUri: string,
    styleId: StyleId,
    customPrompt?: string
  ) => {
    // Basic console tracking for individual retries
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