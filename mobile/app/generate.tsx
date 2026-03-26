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
import { PromptEditor } from "../components/PromptEditor";
import { StyleId, STYLES } from "../constants/config";
import { useDownload } from "../hooks/useDownload";

const { width } = Dimensions.get("window");

export default function GenerateScreen() {
 const { imageUri, selectedStyles } = useLocalSearchParams<{ imageUri: string; selectedStyles: string }>();
const selectedStyleIds = selectedStyles ? selectedStyles.split(",") : [];
  const router = useRouter();
  const { status, results, error, generate, retry, reset } = useGenerate();
  const { downloadToGallery, shareImage } = useDownload();

  const [customPrompt, setCustomPrompt] = useState("");
  const [expandedImage, setExpandedImage] = useState<{ url: string; styleId: StyleId } | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Auto-start generation on mount
  useEffect(() => {
    if (imageUri && !hasStarted) {
      setHasStarted(true);
      generate(imageUri, customPrompt, selectedStyleIds);
    }
  }, [imageUri]);

  const handleRetry = useCallback(
    (styleId: StyleId) => {
      if (!imageUri) return;
      retry(imageUri, styleId, customPrompt);
    },
    [imageUri, customPrompt, retry]
  );

  const handleRegenerate = async () => {
    if (!imageUri) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    reset();
    generate(imageUri, customPrompt, selectedStyleIds);
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

  const handleBack = () => {
    reset();
    router.back();
  };

  const isDone = status === "done";
  const isGenerating = status === "generating" || status === "preparing";
  const successCount = results.filter((r) => r.status === "success").length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isGenerating
            ? "Generating…"
            : isDone
            ? `${successCount} / ${STYLES.length} Ready`
            : "Your Cliparts"}
        </Text>
        {isDone && (
          <TouchableOpacity onPress={handleRegenerate} style={styles.regenBtn}>
            <Text style={styles.regenText}>↺</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Source photo strip */}
        {imageUri && (
          <View style={styles.sourceRow}>
            <Image source={{ uri: imageUri }} style={styles.sourceThumb} />
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceLabel}>Source Photo</Text>
              <Text style={styles.sourceStatus}>
                {isGenerating
                  ? "⚡ Generating all 5 styles in parallel…"
                  : isDone
                  ? `✓ ${successCount} styles completed`
                  : "⏳ Starting…"}
              </Text>
            </View>
          </View>
        )}

        {/* Prompt editor */}
        {!isGenerating && (
          <View style={styles.section}>
            <PromptEditor value={customPrompt} onChange={setCustomPrompt} />
          </View>
        )}

        {/* Error banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️  {error}</Text>
            <TouchableOpacity onPress={handleRegenerate}>
              <Text style={styles.errorRetry}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results or skeletons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Styles</Text>
            {isDone && successCount > 0 && (
              <TouchableOpacity onPress={handleDownloadAll}>
                <Text style={styles.downloadAll}>⬇ Save All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Show skeleton grid when generating, results otherwise */}
          {isGenerating && results.length === 0 ? (
            <SkeletonGrid count={5} />
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

      {/* Fullscreen image modal */}
      <Modal
        visible={!!expandedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setExpandedImage(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setExpandedImage(null)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>

          {expandedImage && (
            <>
              <Image
                source={{ uri: expandedImage.url }}
                style={styles.modalImage}
                resizeMode="contain"
              />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#1E1E2A",
  },
  backBtn: { paddingVertical: 4, paddingRight: 16 },
  backText: { color: "#A78BFA", fontSize: 14, fontWeight: "600" },
  headerTitle: { flex: 1, textAlign: "center", color: "#F1F0FF", fontSize: 15, fontWeight: "700" },
  regenBtn: { paddingLeft: 16 },
  regenText: { fontSize: 20, color: "#7C3AED" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#1E1E2A",
    marginBottom: 16,
  },
  sourceThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#1E1E2A",
  },
  sourceInfo: { flex: 1 },
  sourceLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  sourceStatus: { fontSize: 13, color: "#A78BFA", fontWeight: "500" },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#F1F0FF" },
  downloadAll: { fontSize: 13, color: "#7C3AED", fontWeight: "600" },
  resultsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  errorBanner: {
    backgroundColor: "#EF444420",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: { color: "#EF4444", fontSize: 13, flex: 1 },
  errorRetry: { color: "#F1F0FF", fontSize: 13, fontWeight: "600", marginLeft: 12 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: "#1E1E2A",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: { color: "#F1F0FF", fontSize: 16 },
  modalImage: {
    width: width - 32,
    height: width - 32,
    borderRadius: 20,
    backgroundColor: "#13131A",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
  },
  modalBtnSecondary: { backgroundColor: "#1E1E2A" },
  modalBtnText: { color: "#F1F0FF", fontSize: 14, fontWeight: "700" },
});
