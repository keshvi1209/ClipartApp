import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Dimensions, ScrollView, Animated, TextInput,
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons"; // Swapped emojis for professional icons

const { width } = Dimensions.get("window");

// Updated to use Feather icons instead of emojis for cross-platform consistency
const ALL_STYLES = [
  { id: "cartoon", label: "Cartoon", icon: "smile", desc: "Stylised character art" },
  { id: "anime", label: "Anime", icon: "star", desc: "Japanese animation" },
  { id: "pixel", label: "Pixel Art", icon: "grid", desc: "Retro 8-bit style" },
  { id: "sketch", label: "Sketch", icon: "edit-2", desc: "Hand-drawn outline" },
  { id: "flat", label: "Flat", icon: "layers", desc: "Minimal illustration" },
];

export default function PreviewScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const [selectedStyles, setSelectedStyles] = useState<string[]>(ALL_STYLES.map(s => s.id));
  const [stylePrompts, setStylePrompts] = useState<Record<string, string>>({});
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = useState("");
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color="#A78BFA" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configure Styles</Text>
        <View style={{ width: 40 }} /> {/* Spacer for centering */}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Main Image Preview */}
          <View style={styles.imageWrapper}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <View style={styles.imageOverlay} />
            <View style={styles.imageBadge}>
              <Feather name="check-circle" size={12} color="#F1F0FF" style={{ marginRight: 6 }} />
              <Text style={styles.imageBadgeText}>Ready for Engine</Text>
            </View>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.tagline}>Select Modes</Text>
            <View style={styles.selectRow}>
              <TouchableOpacity onPress={() => setSelectedStyles(ALL_STYLES.map(s => s.id))}>
                <Text style={styles.selectLink}>All</Text>
              </TouchableOpacity>
              <Text style={styles.selectDivider}>/</Text>
              <TouchableOpacity onPress={() => setSelectedStyles([ALL_STYLES[0].id])}>
                <Text style={styles.selectLink}>None</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Style Grid */}
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
                  activeOpacity={0.8}
                >
                  <View style={styles.styleCardTop}>
                    <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
                      <Feather name={style.icon as any} size={18} color={selected ? "#F1F0FF" : "#9CA3AF"} />
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, hasPrompt && styles.actionBtnActive]}
                        onPress={() => openPrompt(style.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Feather name="edit-3" size={14} color={hasPrompt ? "#A78BFA" : "#6B7280"} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.styleLabel, selected && styles.styleLabelSelected]}>{style.label}</Text>
                  <Text style={styles.styleDesc}>{style.desc}</Text>

                  {hasPrompt && (
                    <View style={styles.promptPill}>
                      <Text style={styles.promptPillText} numberOfLines={1}>"{prompt}"</Text>
                      <TouchableOpacity onPress={() => clearPrompt(style.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Feather name="x" size={12} color="#A78BFA" />
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

        </Animated.View>
      </ScrollView>

      {/* --- PROMPT EDITOR BOTTOM SHEET --- */}
      {editingPrompt && (
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.keyboardWrapper}
        >
          <TouchableWithoutFeedback onPress={handleDismissSheet}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.promptSheet}>
            <View style={styles.promptSheetHandle} />
            <Text style={styles.promptSheetTitle}>
              Tweak <Text style={{ color: "#FFFFFF" }}>{ALL_STYLES.find(s => s.id === editingPrompt)?.label}</Text> Style
            </Text>
            <TextInput
              style={styles.promptSheetInput}
              placeholder="e.g. wearing a neon jacket, cyberpunk city background..."
              placeholderTextColor="#4B5563"
              value={draftPrompt}
              onChangeText={setDraftPrompt}
              multiline
              autoFocus
            />
            <View style={styles.promptSheetActions}>
              <TouchableOpacity style={styles.promptSheetCancel} onPress={handleDismissSheet}>
                <Text style={styles.promptSheetCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.promptSheetSave} onPress={savePrompt}>
                <Text style={styles.promptSheetSaveText}>Apply Override</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Generate CTA */}
      {!editingPrompt && (
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[styles.generateBtn, selectedStyles.length === 0 && styles.generateBtnDisabled]}
            onPress={handleGenerate}
            disabled={selectedStyles.length === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.generateBtnText}>
              Initialize Engine ({selectedStyles.length})
            </Text>
            <Feather name="zap" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const CARD_WIDTH = (width - 48 - 12) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050508" },
  
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 24, paddingVertical: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center", marginLeft: -8 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.5 },
  
  scroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 120 },
  
  imageWrapper: {
    borderRadius: 24, overflow: "hidden",
    marginBottom: 32, height: 260,
    borderWidth: 1, borderColor: "#1E1E2A",
  },
  image: { width: "100%", height: "100%" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 5, 8, 0.2)",
  },
  imageBadge: {
    position: "absolute", bottom: 16, left: 16,
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.8)", // Semi-transparent purple
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50,
    backdropFilter: "blur(10px)", // Works on web/newer iOS
  },
  imageBadgeText: { color: "#F1F0FF", fontSize: 12, fontWeight: "600" },
  
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  tagline: { fontSize: 12, letterSpacing: 2, color: "#8B5CF6", textTransform: "uppercase", fontWeight: "700" },
  
  selectRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  selectLink: { fontSize: 13, color: "#9CA3AF", fontWeight: "600" },
  selectDivider: { color: "#374151", fontSize: 12 },

  styleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  styleCard: {
    width: CARD_WIDTH, backgroundColor: "#0D0D14",
    borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: "#1E1E2A",
  },
  styleCardSelected: { borderColor: "#8B5CF6", backgroundColor: "rgba(139, 92, 246, 0.05)" },
  
  styleCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#13131A", borderWidth: 1, borderColor: "#1E1E2A",
    alignItems: "center", justifyContent: "center"
  },
  iconBoxSelected: { backgroundColor: "#8B5CF6", borderColor: "#8B5CF6" },
  
  cardActions: { flexDirection: "row", alignItems: "center" },
  actionBtn: { padding: 6 },
  actionBtnActive: { backgroundColor: "rgba(139, 92, 246, 0.1)", borderRadius: 8 },
  
  styleLabel: { fontSize: 15, fontWeight: "700", color: "#D1D5DB", marginBottom: 4 },
  styleLabelSelected: { color: "#FFFFFF" },
  styleDesc: { fontSize: 12, color: "#6B7280", lineHeight: 16 },
  
  promptPill: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: 12, backgroundColor: "#13131A",
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
    borderWidth: 1, borderColor: "#1E1E2A",
  },
  promptPillText: { flex: 1, fontSize: 11, color: "#A78BFA", fontStyle: "italic", marginRight: 8 },

  keyboardWrapper: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", zIndex: 100, elevation: 10 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5, 5, 8, 0.8)' },
  
  promptSheet: {
    backgroundColor: "#0D0D14",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: "#1E1E2A",
    padding: 24, paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  promptSheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#374151", alignSelf: "center", marginBottom: 20 },
  promptSheetTitle: { fontSize: 14, color: "#9CA3AF", marginBottom: 16, fontWeight: "500" },
  promptSheetInput: {
    backgroundColor: "#050508",
    borderRadius: 16, borderWidth: 1, borderColor: "#1E1E2A",
    padding: 16, color: "#FFFFFF",
    fontSize: 15, lineHeight: 22,
    minHeight: 100, textAlignVertical: "top",
  },
  promptSheetActions: { flexDirection: "row", gap: 12, marginTop: 16 },
  promptSheetCancel: {
    flex: 1, paddingVertical: 16,
    backgroundColor: "#13131A", borderRadius: 16,
    alignItems: "center", borderWidth: 1, borderColor: "#1E1E2A",
  },
  promptSheetCancelText: { color: "#9CA3AF", fontSize: 15, fontWeight: "600" },
  promptSheetSave: { flex: 1, paddingVertical: 16, backgroundColor: "#8B5CF6", borderRadius: 16, alignItems: "center" },
  promptSheetSaveText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },

  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingVertical: 20, paddingBottom: Platform.OS === "ios" ? 36 : 24,
    backgroundColor: "#050508",
    borderTopWidth: 1, borderColor: "#1E1E2A",
  },
  generateBtn: {
    flexDirection: "row", backgroundColor: "#8B5CF6", borderRadius: 16,
    paddingVertical: 18, alignItems: "center", justifyContent: "center",
  },
  generateBtnDisabled: { backgroundColor: "#1E1E2A" },
  generateBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.5 },
});