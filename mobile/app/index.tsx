import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";
import { useImagePicker } from "../hooks/useImagePicker";
// import { Easing } from "react-native-reanimated";


const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { imageUri, pickFromGallery, pickFromCamera, clearImage } = useImagePicker();

  // Floating animation for the upload zone
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Gentle float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleGenerate = async () => {
    if (!imageUri) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/generate", params: { imageUri } });
  };

  const handlePickGallery = async () => {
    await Haptics.selectionAsync();
    pickFromGallery();
  };

  const handlePickCamera = async () => {
    await Haptics.selectionAsync();
    pickFromCamera();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.tagline}>AI-powered</Text>
          <Text style={styles.title}>Clipart{"\n"}Generator</Text>
          <View style={styles.titleAccent} />
        </View>

        {/* Upload Zone */}
        <Animated.View
          style={[
            styles.uploadZoneWrapper,
            { transform: [{ translateY: floatAnim }] },
          ]}
        >
          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <View style={styles.previewOverlay}>
                <TouchableOpacity
                  style={styles.changeBtn}
                  onPress={clearImage}
                  activeOpacity={0.7}
                >
                  <Text style={styles.changeBtnText}>✕  Change Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.uploadZone}>
              <Text style={styles.uploadIcon}>🖼️</Text>
              <Text style={styles.uploadTitle}>Upload Your Photo</Text>
              <Text style={styles.uploadSub}>
                Best results with a clear, well-lit face photo
              </Text>

              <View style={styles.uploadButtons}>
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={handlePickGallery}
                  activeOpacity={0.75}
                >
                  <Text style={styles.uploadBtnIcon}>🗂️</Text>
                  <Text style={styles.uploadBtnText}>Gallery</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={handlePickCamera}
                  activeOpacity={0.75}
                >
                  <Text style={styles.uploadBtnIcon}>📷</Text>
                  <Text style={styles.uploadBtnText}>Camera</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Style pills preview */}
        <View style={styles.stylesPreview}>
          {["🎨 Cartoon", "✨ Anime", "👾 Pixel", "✏️ Sketch", "🖼️ Flat"].map((s) => (
            <View key={s} style={styles.stylePill}>
              <Text style={styles.stylePillText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.generateBtn, !imageUri && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={!imageUri}
          activeOpacity={0.85}
        >
          <Text style={styles.generateBtnText}>
            {imageUri ? "✦  Generate All Styles" : "Select a Photo First"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0F",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  tagline: {
    fontSize: 12,
    letterSpacing: 4,
    color: "#7C3AED",
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 8,
  },
  title: {
    fontSize: 44,
    fontWeight: "800",
    color: "#F1F0FF",
    lineHeight: 48,
    letterSpacing: -1,
  },
  titleAccent: {
    width: 40,
    height: 3,
    backgroundColor: "#7C3AED",
    borderRadius: 2,
    marginTop: 12,
  },
  uploadZoneWrapper: {
    flex: 1,
    marginBottom: 20,
  },
  uploadZone: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#1E1E2A",
    borderStyle: "dashed",
    backgroundColor: "#13131A",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F1F0FF",
    marginBottom: 8,
  },
  uploadSub: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  uploadButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  uploadBtn: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: "#1E1E2A",
    borderRadius: 14,
  },
  divider: {
    width: 12,
  },
  uploadBtnIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  uploadBtnText: {
    fontSize: 13,
    color: "#A78BFA",
    fontWeight: "600",
  },
  previewContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  previewImage: {
    flex: 1,
    resizeMode: "cover",
  },
  previewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "rgba(10,10,15,0.5)",
    alignItems: "center",
  },
  changeBtn: {
    backgroundColor: "rgba(30,30,42,0.9)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#1E1E2A",
  },
  changeBtnText: {
    color: "#F1F0FF",
    fontSize: 13,
    fontWeight: "600",
  },
  stylesPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  stylePill: {
    backgroundColor: "#13131A",
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#1E1E2A",
  },
  stylePillText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  generateBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  generateBtnDisabled: {
    backgroundColor: "#1E1E2A",
    shadowOpacity: 0,
    elevation: 0,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F1F0FF",
    letterSpacing: 0.3,
  },
});
