import { useState } from "react";
import { Alert } from "react-native";

export interface ComparisonImage {
  beforeUri: string;
  afterUri: string;
  styleId: string;
}

export function useBeforeAfter() {
  const [comparisons, setComparisons] = useState<ComparisonImage[]>([]);
  const [activeComparison, setActiveComparison] = useState<string | null>(null);

  const addComparison = (beforeUri: string, afterUri: string, styleId: string) => {
    setComparisons((prev) => {
      // Remove if already exists
      const filtered = prev.filter((c) => c.styleId !== styleId);
      return [...filtered, { beforeUri, afterUri, styleId }];
    });
    setActiveComparison(styleId);
  };

  const removeComparison = (styleId: string) => {
    setComparisons((prev) => prev.filter((c) => c.styleId !== styleId));
    if (activeComparison === styleId) {
      setActiveComparison(null);
    }
  };

  const getComparison = (styleId: string) => {
    return comparisons.find((c) => c.styleId === styleId);
  };

  return {
    comparisons,
    activeComparison,
    setActiveComparison,
    addComparison,
    removeComparison,
    getComparison,
  };
}
