import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, shadows } from "../constants/theme";

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
            <Feather name="x" size={16} color={colors.danger} />
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
            color={colors.accent}
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    ...shadows.soft,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  inputContainer: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 60,
  },
  input: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  charCount: {
    color: colors.textMuted,
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
    color: colors.textSecondary,
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
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  presetText: {
    color: colors.accentDark,
    fontSize: 11,
    fontWeight: "600",
  },
  hint: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 10,
    lineHeight: 14,
  },
});
