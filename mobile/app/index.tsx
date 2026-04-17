import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";
import { useImagePicker } from "../hooks/useImagePicker";
import { Feather } from "@expo/vector-icons";
import { colors, shadows } from "../constants/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { pickFromGallery, pickFromCamera } = useImagePicker();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleGallery = async () => {
    await Haptics.selectionAsync();
    const uri = await pickFromGallery();
    if (uri) router.push({ pathname: "/preview", params: { imageUri: uri } });
  };

  const handleCamera = async () => {
    await Haptics.selectionAsync();
    const uri = await pickFromCamera();
    if (uri) router.push({ pathname: "/preview", params: { imageUri: uri } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.tagline}>AI Clipart Studio</Text>
          <Text style={styles.title}>Create polished clipart in minutes</Text>
          <Text style={styles.subtitle}>
            Upload a photo and get 5 professional styles instantly.
          </Text>
        </View>

        {/* Upload Zone */}
        <Animated.View style={[styles.uploadZoneWrapper, { transform: [{ translateY: floatAnim }] }]}>
          <View style={styles.uploadZone}>
            <View style={styles.uploadIcon}>
              <Feather name="image" size={28} color={colors.accent} />
            </View>
            <Text style={styles.uploadTitle}>Upload a photo</Text>
            <Text style={styles.uploadSub}>
              Clear, well-lit photos create the most accurate results.
            </Text>
            <View style={styles.uploadButtons}>
              <TouchableOpacity style={styles.uploadBtnPrimary} onPress={handleGallery} activeOpacity={0.75}>
                <Feather name="upload" size={16} color="#FFFFFF" />
                <Text style={styles.uploadBtnTextPrimary}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadBtnSecondary} onPress={handleCamera} activeOpacity={0.75}>
                <Feather name="camera" size={16} color={colors.text} />
                <Text style={styles.uploadBtnTextSecondary}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Style pills preview */}
        <View style={styles.stylesPreview}>
          {["Cartoon", "Anime", "Pixel Art", "Sketch", "Flat Art"].map((s) => (
            <View key={s} style={styles.stylePill}>
              <Text style={styles.stylePillText}>{s}</Text>
            </View>
          ))}
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintText}>Select a photo to get started</Text>
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  header: { marginBottom: 28 },
  tagline: {
    fontSize: 12,
    letterSpacing: 2.5,
    color: colors.accent,
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 34,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  uploadZoneWrapper: { flex: 1, marginBottom: 20 },
  uploadZone: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    ...shadows.card,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 8 },
  uploadSub: { fontSize: 13, color: colors.textSecondary, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  uploadButtons: { flexDirection: "row", alignItems: "center", gap: 12 },
  uploadBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.accent,
    borderRadius: 12,
  },
  uploadBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadBtnTextPrimary: { fontSize: 13, color: "#FFFFFF", fontWeight: "700" },
  uploadBtnTextSecondary: { fontSize: 13, color: colors.text, fontWeight: "700" },
  stylesPreview: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  stylePill: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stylePillText: { fontSize: 12, color: colors.textSecondary, fontWeight: "600" },
  hint: { alignItems: "center" },
  hintText: { fontSize: 13, color: colors.textMuted },
});
