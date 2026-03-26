import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Dimensions, ScrollView, Animated, TextInput,
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

const ALL_STYLES = [
  { id: "cartoon", label: "Cartoon", emoji: "🎨", desc: "Stylised character art" },
  { id: "anime", label: "Anime", emoji: "✨", desc: "Japanese animation" },
  { id: "pixel", label: "Pixel Art", emoji: "👾", desc: "Retro 8-bit style" },
  { id: "sketch", label: "Sketch", emoji: "✏️", desc: "Hand-drawn outline" },
  { id: "flat", label: "Flat", emoji: "🖼️", desc: "Minimal illustration" },
];

export default function PreviewScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const [selectedStyles, setSelectedStyles] = useState<string[]>(ALL_STYLES.map(s => s.id));
  const [stylePrompts, setStylePrompts] = useState<Record<string, string>>({});
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleStyle = async (id: string) => {
    if (editingPrompt) return; 
    await Haptics.selectionAsync();
    setSelectedStyles(prev =>
      prev.includes(id)
        ? prev.length === 1 ? prev
        : prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const openPrompt = async (id: string) => {
    await Haptics.selectionAsync();
    setDraftPrompt(stylePrompts[id] || "");
    setEditingPrompt(id);
  };

  const savePrompt = async () => {
    if (!editingPrompt) return;
    await Haptics.selectionAsync();
    setStylePrompts(prev => ({ ...prev, [editingPrompt]: draftPrompt.trim() }));
    setEditingPrompt(null);
    setDraftPrompt("");
    Keyboard.dismiss();
  };

  const clearPrompt = (id: string) => {
    setStylePrompts(prev => ({ ...prev, [id]: "" }));
  };

  const handleDismissSheet = () => {
    Keyboard.dismiss();
    setEditingPrompt(null);
    setDraftPrompt("");
  };

  const handleGenerate = async () => {
    if (!imageUri || selectedStyles.length === 0) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const firstCustomPrompt = Object.values(stylePrompts).find(p => p.trim() !== "") || "";

    router.push({
      pathname: "/result",
      params: {
        imageUri,
        selectedStyles: selectedStyles.join(","), 
        customPrompt: firstCustomPrompt,          
        stylePrompts: JSON.stringify(stylePrompts),
      },
    });
  };

  const handleBack = () => router.back();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Photo</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* keyboardShouldPersistTaps allows buttons inside the scrollview to be tapped while keyboard is open */}
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>✓ Photo ready</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Styles</Text>
            <Text style={styles.sectionSub}>Tap to select · ✏️ to add a custom prompt</Text>

            <View style={styles.styleGrid}>
              {ALL_STYLES.map((style) => {
                const selected = selectedStyles.includes(style.id);
                const prompt = stylePrompts[style.id];
                const hasPrompt = !!prompt;

                return (
                  <TouchableOpacity
                    key={style.id}
                    style={[styles.styleCard, selected && styles.styleCardSelected]}
                    onPress={() => toggleStyle(style.id)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.styleCardTop}>
                      <Text style={styles.styleEmoji}>{style.emoji}</Text>
                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          style={[styles.pencilBtn, hasPrompt && styles.pencilBtnActive]}
                          onPress={() => openPrompt(style.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.pencilIcon}>✏️</Text>
                        </TouchableOpacity>
                        {selected && (
                          <View style={styles.checkBadge}>
                            <Text style={styles.checkText}>✓</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Text style={[styles.styleLabel, selected && styles.styleLabelSelected]}>
                      {style.label}
                    </Text>
                    <Text style={styles.styleDesc}>{style.desc}</Text>

                    {hasPrompt && (
                      <View style={styles.promptPill}>
                        <Text style={styles.promptPillText} numberOfLines={1}>
                          "{prompt}"
                        </Text>
                        <TouchableOpacity
                          onPress={() => clearPrompt(style.id)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Text style={styles.promptPillClear}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.selectRow}>
            <TouchableOpacity onPress={() => setSelectedStyles(ALL_STYLES.map(s => s.id))}>
              <Text style={styles.selectLink}>Select all</Text>
            </TouchableOpacity>
            <Text style={styles.selectDivider}>·</Text>
            <TouchableOpacity onPress={() => setSelectedStyles([ALL_STYLES[0].id])}>
              <Text style={styles.selectLink}>Clear</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>

      {/* --- PROMPT EDITOR BOTTOM SHEET WITH KEYBOARD AVOIDANCE --- */}
      {editingPrompt && (
        <>
          {/* Invisible backdrop to detect taps outside the bottom sheet */}
          <TouchableWithoutFeedback onPress={handleDismissSheet}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.keyboardWrapper}
          >
            <View style={styles.promptSheet}>
              <View style={styles.promptSheetHandle} />
              <Text style={styles.promptSheetTitle}>
                {ALL_STYLES.find(s => s.id === editingPrompt)?.emoji}{" "}
                Custom prompt for{" "}
                <Text style={styles.promptSheetStyleName}>
                  {ALL_STYLES.find(s => s.id === editingPrompt)?.label}
                </Text>
              </Text>
              <TextInput
                style={styles.promptSheetInput}
                placeholder="e.g. wearing a hoodie, night background…"
                placeholderTextColor="#3D3D55"
                value={draftPrompt}
                onChangeText={setDraftPrompt}
                multiline
                autoFocus
              />
              <View style={styles.promptSheetActions}>
                <TouchableOpacity
                  style={styles.promptSheetCancel}
                  onPress={handleDismissSheet}
                >
                  <Text style={styles.promptSheetCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.promptSheetSave} onPress={savePrompt}>
                  <Text style={styles.promptSheetSaveText}>✓  Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </>
      )}

      {/* Generate CTA */}
      {!editingPrompt && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.generateBtn, selectedStyles.length === 0 && styles.generateBtnDisabled]}
            onPress={handleGenerate}
            disabled={selectedStyles.length === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.generateBtnText}>
              Generate {selectedStyles.length} Style{selectedStyles.length > 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const CARD_WIDTH = (width - 48 - 12) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0F" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: "#1A1A24",
  },
  backBtn: { paddingVertical: 4, paddingRight: 16 },
  backText: { color: "#8B7CF6", fontSize: 14 },
  headerTitle: { fontSize: 15, fontWeight: "600", color: "#E8E7F5" },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  imageWrapper: {
    borderRadius: 16, overflow: "hidden",
    marginBottom: 28, height: 240, position: "relative",
  },
  image: { width: "100%", height: "100%" },
  imageBadge: {
    position: "absolute", bottom: 12, left: 12,
    backgroundColor: "rgba(90,40,180,0.75)",
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 50,
  },
  imageBadgeText: { color: "#E8E7F5", fontSize: 11 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "600", color: "#E8E7F5", marginBottom: 4 },
  sectionSub: { fontSize: 12, color: "#555568", marginBottom: 16, lineHeight: 18 },
  styleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  styleCard: {
    width: CARD_WIDTH, backgroundColor: "#111118",
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#1E1E2A",
  },
  styleCardSelected: { borderColor: "#6D3AE0", backgroundColor: "#100F1C" },
  styleCardTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10,
  },
  styleEmoji: { fontSize: 24 },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  pencilBtn: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: "#1A1A26",
    alignItems: "center", justifyContent: "center",
  },
  pencilBtnActive: { backgroundColor: "#2D1A52" },
  pencilIcon: { fontSize: 11 },
  checkBadge: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: "#6D3AE0",
    alignItems: "center", justifyContent: "center",
  },
  checkText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  styleLabel: { fontSize: 13, fontWeight: "500", color: "#6B6B80", marginBottom: 3 },
  styleLabelSelected: { color: "#E8E7F5" },
  styleDesc: { fontSize: 11, color: "#3D3D4E", lineHeight: 15 },
  promptPill: {
    flexDirection: "row", alignItems: "center",
    marginTop: 8, backgroundColor: "#1E1530",
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5,
    borderWidth: 1, borderColor: "#3D2470", gap: 6,
  },
  promptPillText: {
    flex: 1, fontSize: 10, color: "#A990E8",
    fontStyle: "italic", lineHeight: 14,
  },
  promptPillClear: { fontSize: 10, color: "#5A4480" },
  selectRow: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginBottom: 8, marginTop: 4,
  },
  selectLink: { fontSize: 12, color: "#6D3AE0" },
  selectDivider: { color: "#2A2A38" },

  // --- NEW KEYBOARD & SHEET STYLES ---
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)', 
    zIndex: 99,
  },
  keyboardWrapper: {
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0,
    zIndex: 100, 
  },
  promptSheet: {
    backgroundColor: "#13121E",
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderTopWidth: 1, borderColor: "#2A2040",
    padding: 20, paddingBottom: 36,
  },
  // -----------------------------------

  promptSheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "#2A2A3A",
    alignSelf: "center", marginBottom: 16,
  },
  promptSheetTitle: {
    fontSize: 13, color: "#8B8BA0",
    marginBottom: 12,
  },
  promptSheetStyleName: { color: "#E8E7F5", fontWeight: "600" },
  promptSheetInput: {
    backgroundColor: "#0E0D18",
    borderRadius: 12, borderWidth: 1, borderColor: "#2A2040",
    padding: 14, color: "#E8E7F5",
    fontSize: 14, lineHeight: 22,
    minHeight: 90, textAlignVertical: "top",
  },
  promptSheetActions: {
    flexDirection: "row", gap: 10, marginTop: 12,
  },
  promptSheetCancel: {
    flex: 1, paddingVertical: 13,
    backgroundColor: "#1A1928", borderRadius: 12,
    alignItems: "center", borderWidth: 1, borderColor: "#2A2040",
  },
  promptSheetCancelText: { color: "#6B6B80", fontSize: 14 },
  promptSheetSave: {
    flex: 1, paddingVertical: 13,
    backgroundColor: "#6D3AE0", borderRadius: 12,
    alignItems: "center",
  },
  promptSheetSaveText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 32,
    backgroundColor: "#0A0A0F",
    borderTopWidth: 1, borderColor: "#1A1A24",
  },
  generateBtn: {
    backgroundColor: "#6D3AE0", borderRadius: 14,
    paddingVertical: 16, alignItems: "center", elevation: 6,
  },
  generateBtnDisabled: { backgroundColor: "#161620", elevation: 0 },
  generateBtnText: { fontSize: 15, fontWeight: "600", color: "#E8E7F5", letterSpacing: 0.2 },
});