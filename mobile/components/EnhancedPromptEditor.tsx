import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface PromptEditorProps {
  value: string;
  onChange: (text: string) => void;
}

const PRESETS = [
  { label: "Professional", value: "professional, high quality, well-lit, studio style" },
  { label: "Dramatic", value: "dramatic lighting, intense, powerful expression, cinematic" },
  { label: "Friendly", value: "friendly smile, warm lighting, approachable, cheerful" },
  { label: "Artistic", value: "artistic, creative, imaginative, expressive, unique" },
  { label: "Futuristic", value: "futuristic, cyberpunk, neon, high tech aesthetic" },
  { label: "Fantasy", value: "fantasy, magical, mystical, ethereal, whimsical" },
];

export function PromptEditor({ value, onChange }: PromptEditorProps) {
  const [showPresets, setShowPresets] = React.useState(false);

  const applyPreset = (preset: string) => {
    const newValue = value ? `${value}, ${preset}` : preset;
    onChange(newValue);
    setShowPresets(false);
  };

  const clearPrompt = () => {
    onChange("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>✏️ Customize</Text>
        {value && (
          <TouchableOpacity onPress={clearPrompt}>
            <Feather name="x" size={16} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add details, mood, style..."
          placeholderTextColor="#6B7280"
          value={value}
          onChangeText={onChange}
          multiline
          maxLength={150}
        />
        <Text style={styles.charCount}>{value.length}/150</Text>
      </View>

      {/* Preset buttons */}
      <View style={styles.presetsHeader}>
        <Text style={styles.presetsLabel}>Quick Presets:</Text>
        <TouchableOpacity
          onPress={() => setShowPresets(!showPresets)}
          style={styles.toggleBtn}
        >
          <Feather
            name={showPresets ? "chevron-up" : "chevron-down"}
            size={16}
            color="#A78BFA"
          />
        </TouchableOpacity>
      </View>

      {showPresets && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.presetsScroll}
          contentContainerStyle={styles.presetsContent}
        >
          {PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.label}
              style={styles.presetTag}
              onPress={() => applyPreset(preset.value)}
            >
              <Text style={styles.presetText}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.hint}>
        💡 Tip: Add style words for better results (e.g., "professional", "happy", "dramatic")
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#13131A",
    borderWidth: 1,
    borderColor: "#1E1E2A",
    borderRadius: 14,
    padding: 14,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    color: "#F1F0FF",
    fontSize: 13,
    fontWeight: "700",
  },
  inputContainer: {
    backgroundColor: "#0A0A0F",
    borderWidth: 1,
    borderColor: "#2a2a3a",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 60,
  },
  input: {
    color: "#F1F0FF",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  charCount: {
    color: "#6B7280",
    fontSize: 10,
    marginTop: 6,
  },
  presetsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  presetsLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
  },
  toggleBtn: {
    padding: 4,
  },
  presetsScroll: {
    marginHorizontal: -14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  presetsContent: {
    gap: 8,
  },
  presetTag: {
    backgroundColor: "rgba(124,58,237,0.15)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  presetText: {
    color: "#A78BFA",
    fontSize: 11,
    fontWeight: "600",
  },
  hint: {
    color: "#6B7280",
    fontSize: 10,
    marginTop: 10,
    lineHeight: 14,
  },
});
