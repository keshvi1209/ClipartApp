import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import { Feather } from "@expo/vector-icons";
import { StyleResult } from "../hooks/useGenerate";
import { STYLES, StyleId } from "../constants/config";
import { useDownload } from "../hooks/useDownload";
import { colors, shadows } from "../constants/theme";

interface ResultCardProps {
  result: StyleResult;
  onRetry: (styleId: StyleId) => void;
  onExpand: (url: string, styleId: StyleId) => void;
}

export function ResultCard({ result, onRetry, onExpand }: ResultCardProps) {
  const style = STYLES.find((s) => s.id === result.styleId)!;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const { downloadToGallery, shareImage } = useDownload();
  const [fileUri, setFileUri] = useState<string | null>(null);

  // Convert large base64 data URI to file for better performance
  useEffect(() => {
    if (result.status === "success" && result.url && result.url.startsWith("data:")) {
      const convertToFile = async () => {
        try {
          console.log(`📁 Converting base64 to file for ${result.styleId}...`);
          const tempFile = `${FileSystem.cacheDirectory}clipart_${result.styleId}_temp.png`;
          // Extract base64 from data URI
          const base64 = result.url!.replace(/^data:image\/\w+;base64,/, "");
          await FileSystem.writeAsStringAsync(tempFile, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setFileUri(tempFile);
          console.log(`✅ File saved: ${tempFile}`);
        } catch (error) {
          console.error(`❌ Failed to convert to file for ${result.styleId}:`, error);
          // Fallback to data URI if file conversion fails
          setFileUri(result.url!);
        }
      };
      convertToFile();
    }
  }, [result.url, result.status]);

  useEffect(() => {
    console.log(`🎴 ResultCard ${result.styleId}:`, {
      status: result.status,
      hasUrl: !!result.url,
      urlLength: result.url?.length,
      hasFileUri: !!fileUri,
      error: result.error,
    });
  }, [result, fileUri]);

  useEffect(() => {
    if (result.status === "success") {
      console.log(`🎬 Starting animation for ${result.styleId}`);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        console.log(`✨ Animation complete for ${result.styleId}`);
      });
    }
  }, [result.status]);

  const handleDownload = async () => {
    if (!result.url) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const ok = await downloadToGallery(result.url, result.styleId);
    if (ok) {
      // brief success feedback is enough — no Alert needed
    }
  };

  const handleShare = async () => {
    if (!result.url) return;
    await Haptics.selectionAsync();
    shareImage(result.url, result.styleId);
  };

  const handleExpand = async () => {
    if (!result.url) return;
    await Haptics.selectionAsync();
    onExpand(result.url, result.styleId);
  };

  return (
    <View style={styles.card}>
      {/* Image area */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={handleExpand}
        disabled={result.status !== "success"}
        activeOpacity={0.9}
      >
        {result.status === "loading" && (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.accent} size="small" />
            <Text style={styles.loadingText}>Generating…</Text>
          </View>
        )}

        {result.status === "success" && (fileUri || result.url) && (
          <>
            <Animated.Image
              source={{ uri: fileUri || result.url! }}
              style={[styles.image, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
              resizeMode="cover"
              onLoad={() => console.log(`✅ Image loaded: ${result.styleId}`)}
              onError={(error) => console.log(`❌ Image error ${result.styleId}:`, error)}
            />
          </>
        )}

        {result.status === "error" && (
          <View style={styles.errorState}>
            <Feather name="alert-triangle" size={20} color={colors.danger} />
            <Text style={styles.errorText}>Generation failed</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => onRetry(result.styleId as StyleId)}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Style badge */}
        <View style={[styles.badge, { backgroundColor: style.color + "22" }]}>
          <Text style={styles.badgeEmoji}>{style.emoji}</Text>
          <Text style={[styles.badgeLabel, { color: style.color }]}>{style.label}</Text>
        </View>
      </TouchableOpacity>

      {/* Actions — only show when successful */}
      {result.status === "success" && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleDownload} activeOpacity={0.7}>
            <Feather name="download" size={16} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.7}>
            <Feather name="share-2" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surfaceMuted,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingState: {
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
  },
  errorState: {
    alignItems: "center",
    gap: 6,
  },
  errorText: { fontSize: 12, color: colors.danger, textAlign: "center" },
  retryBtn: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryText: { fontSize: 12, color: colors.accentDark, fontWeight: "600" },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeEmoji: { fontSize: 11 },
  badgeLabel: { fontSize: 11, fontWeight: "700" },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
});
