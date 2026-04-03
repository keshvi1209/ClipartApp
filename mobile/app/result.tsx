import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

import { useGenerate } from "../hooks/useGenerate";
import { SkeletonGrid } from "../components/SkeletonLoader";
import { ResultCard } from "../components/ResultCard";
import { StyleId } from "../constants/config";
import { useDownload } from "../hooks/useDownload";

const { width } = Dimensions.get("window");

export default function ResultScreen() {
  // 🔴 Catching the exact parameters passed from preview.tsx
  const { imageUri, selectedStyles, customPrompt } = useLocalSearchParams<{
    imageUri: string;
    selectedStyles: string;
    customPrompt: string;
  }>();

  // Convert the comma-separated string back into an array of IDs
  const selectedStyleIds = selectedStyles ? selectedStyles.split(",") as StyleId[] : [];
  
  const router = useRouter();
  const { status, results, error, generate, retry, reset } = useGenerate();
  const { downloadToGallery, shareImage } = useDownload();

  const [expandedImage, setExpandedImage] = useState<{ url: string; styleId: StyleId } | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (imageUri && !hasStarted) {
      setHasStarted(true);
      // Firing generation automatically on load
      generate(imageUri, customPrompt || "", selectedStyleIds);
    }
  }, [imageUri]);

  const handleRetry = useCallback(
    (styleId: StyleId) => {
      if (!imageUri) return;
      retry(imageUri, styleId, customPrompt || "");
    },
    [imageUri, customPrompt, retry]
  );

  const handleRegenerate = async () => {
    if (!imageUri) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    reset();
    generate(imageUri, customPrompt || "", selectedStyleIds);
  };

  const handleDownloadAll = async () => {
    const successful = results.filter((r) => r.status === "success" && r.url);
    if (!successful.length) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const { status: perm } = await MediaLibrary.requestPermissionsAsync();
    if (perm !== "granted") {
      Alert.alert("Permission Required", "Grant media access to save images.");
      return;
    }

    let saved = 0;
    for (const r of successful) {
      try {
        const fileUri = FileSystem.cacheDirectory + `clipart_${r.styleId}_${Date.now()}.png`;
        const { uri } = await FileSystem.downloadAsync(r.url!, fileUri);
        await MediaLibrary.saveToLibraryAsync(uri);
        saved++;
      } catch {}
    }
    Alert.alert("Saved!", `${saved} image${saved > 1 ? "s" : ""} saved to your gallery.`);
  };

  const isDone = status === "done";
  const isGenerating = status === "generating" || status === "preparing";
  const successCount = results.filter((r) => r.status === "success").length;

  // Debug logging
  useEffect(() => {
    console.log("🖼️ Result Screen State:", {
      status,
      isGenerating,
      isDone,
      resultsCount: results.length,
      successCount,
      results: results.map(r => ({ 
        styleId: r.styleId, 
        status: r.status, 
        hasUrl: !!r.url 
      }))
    });
  }, [status, results]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isGenerating ? "Creating Magic..." : isDone ? "Your Results" : "Results"}
        </Text>
        {isDone && (
          <TouchableOpacity onPress={handleRegenerate} style={styles.regenBtn}>
            <Text style={styles.regenText}>↺</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* The Professional Summary Card */}
        {imageUri && (
          <View style={styles.summaryCard}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/download.png')} 
                style={styles.aiLogo} 
                resizeMode="contain"
              />
            </View>

            <View style={styles.summaryContent}>
              <Text style={styles.summaryPrompt} numberOfLines={2}>
                {customPrompt ? `"${customPrompt}"` : "Auto-generating styles"}
              </Text>
              
              <View style={styles.tagsContainer}>
                {selectedStyleIds.map((tag, index) => (
                  <View key={index} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Image source={{ uri: imageUri }} style={styles.sourceThumb} />
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️  {error}</Text>
            <TouchableOpacity onPress={handleRegenerate}>
              <Text style={styles.errorRetry}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isGenerating ? "Generating..." : "Generated Cliparts"}
            </Text>
            {isDone && successCount > 0 && (
              <TouchableOpacity onPress={handleDownloadAll} style={styles.downloadAllBtn}>
                <Text style={styles.downloadAll}>⬇ Save All</Text>
              </TouchableOpacity>
            )}
          </View>

          {isGenerating && results.length === 0 ? (
            <SkeletonGrid count={selectedStyleIds.length || 5} />
          ) : (
            <View style={styles.resultsGrid}>
              {results.map((result) => (
                <ResultCard
                  key={result.styleId}
                  result={result}
                  onRetry={handleRetry}
                  onExpand={(url, styleId) => setExpandedImage({ url, styleId })}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={!!expandedImage} transparent animationType="fade" onRequestClose={() => setExpandedImage(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setExpandedImage(null)}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>

          {expandedImage && (
            <>
              <Image source={{ uri: expandedImage.url }} style={styles.modalImage} resizeMode="contain" />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={() => {
                    downloadToGallery(expandedImage.url, expandedImage.styleId);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }}
                >
                  <Text style={styles.modalBtnText}>⬇  Save to Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSecondary]}
                  onPress={() => shareImage(expandedImage.url, expandedImage.styleId)}
                >
                  <Text style={styles.modalBtnText}>↗  Share</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0F" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: "#1E1E2A",
  },
  backBtn: { paddingVertical: 4, paddingRight: 16 },
  backText: { color: "#A78BFA", fontSize: 14, fontWeight: "600" },
  headerTitle: { flex: 1, textAlign: "center", color: "#F1F0FF", fontSize: 15, fontWeight: "700" },
  regenBtn: { paddingLeft: 16 },
  regenText: { fontSize: 20, color: "#7C3AED" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  
  summaryCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#13131A", borderRadius: 16,
    padding: 12, marginTop: 20, marginBottom: 24,
    borderWidth: 1, borderColor: "#1E1E2A",
  },
  logoContainer: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#1E1E2A", justifyContent: "center",
    alignItems: "center", marginRight: 12,
  },
  aiLogo: { width: 24, height: 24 },
  summaryContent: { flex: 1, justifyContent: "center" },
  summaryPrompt: {
    color: "#F1F0FF", fontSize: 14, fontWeight: "500",
    marginBottom: 8, fontStyle: "italic",
  },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tagBadge: {
    backgroundColor: "#7C3AED30", paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 8, borderWidth: 1,
    borderColor: "#7C3AED80",
  },
  tagText: { color: "#A78BFA", fontSize: 10, fontWeight: "700" },
  sourceThumb: {
    width: 56, height: 56, borderRadius: 10,
    backgroundColor: "#1E1E2A", marginLeft: 12,
  },

  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#F1F0FF" },
  downloadAllBtn: {
    backgroundColor: "#7C3AED20", paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 12,
  },
  downloadAll: { fontSize: 13, color: "#A78BFA", fontWeight: "600" },
  resultsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  errorBanner: {
    backgroundColor: "#EF444420", borderWidth: 1, borderColor: "#EF4444",
    borderRadius: 12, padding: 14, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center", marginBottom: 16,
  },
  errorText: { color: "#EF4444", fontSize: 13, flex: 1 },
  errorRetry: { color: "#F1F0FF", fontSize: 13, fontWeight: "600", marginLeft: 12 },
  
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center", alignItems: "center",
  },
  modalClose: {
    position: "absolute", top: 60, right: 20, zIndex: 10,
    backgroundColor: "#1E1E2A", width: 40, height: 40,
    borderRadius: 20, alignItems: "center", justifyContent: "center",
  },
  modalCloseText: { color: "#F1F0FF", fontSize: 16 },
  modalImage: {
    width: width - 32, height: width - 32,
    borderRadius: 20, backgroundColor: "#13131A",
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  modalBtn: {
    backgroundColor: "#7C3AED", paddingHorizontal: 22,
    paddingVertical: 14, borderRadius: 14,
  },
  modalBtnSecondary: { backgroundColor: "#1E1E2A" },
  modalBtnText: { color: "#F1F0FF", fontSize: 14, fontWeight: "700" },
});