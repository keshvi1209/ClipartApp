import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";
import { StyleResult } from "../hooks/useGenerate";
import { STYLES, StyleId } from "../constants/config";
import { useDownload } from "../hooks/useDownload";

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

  useEffect(() => {
    if (result.status === "success") {
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
      ]).start();
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
            <ActivityIndicator color="#7C3AED" size="small" />
            <Text style={styles.loadingText}>Generating…</Text>
          </View>
        )}

        {result.status === "success" && result.url && (
          <Animated.Image
            source={{ uri: result.url }}
            style={[styles.image, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
            resizeMode="cover"
          />
        )}

        {result.status === "error" && (
          <View style={styles.errorState}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>Failed</Text>
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
            <Text style={styles.actionIcon}>⬇️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>↗️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: "#13131A",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1E1E2A",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#0D0D14",
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
    color: "#6B7280",
    fontWeight: "500",
  },
  errorState: {
    alignItems: "center",
    gap: 6,
  },
  errorIcon: { fontSize: 24 },
  errorText: { fontSize: 12, color: "#EF4444" },
  retryBtn: {
    backgroundColor: "#1E1E2A",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  retryText: { fontSize: 12, color: "#A78BFA", fontWeight: "600" },
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
    borderColor: "#1E1E2A",
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  actionIcon: { fontSize: 16 },
});
