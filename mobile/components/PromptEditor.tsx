import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { colors, shadows } from "../constants/theme";

interface PromptEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const QUICK_PROMPTS = [
  "superhero",
  "vintage poster",
  "neon glow",
  "watercolor",
  "dark fantasy",
];

export function PromptEditor({ value, onChange }: PromptEditorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggle}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleLabel}>
          {expanded ? "▾" : "▸"}  Custom Prompt  {value ? "✦" : ""}
        </Text>
        <Text style={styles.toggleSub}>Add your own style twist</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.editorBody}>
          <TextInput
            style={styles.input}
            placeholder="e.g. glowing eyes, dark fantasy background…"
            placeholderTextColor="#4B5563"
            value={value}
            onChangeText={onChange}
            multiline
            maxLength={200}
          />
          <Text style={styles.charCount}>{value.length}/200</Text>

          <Text style={styles.quickLabel}>Quick picks:</Text>
          <View style={styles.quickRow}>
            {QUICK_PROMPTS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.quickChip, value === p && styles.quickChipActive]}
                onPress={() => onChange(value === p ? "" : p)}
              >
                <Text
                  style={[styles.quickChipText, value === p && styles.quickChipTextActive]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadows.soft,
  },
  toggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accentDark,
  },
  toggleSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  editorBody: {
    borderTopWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    padding: 12,
    color: colors.text,
    fontSize: 14,
    minHeight: 70,
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "right",
  },
  quickLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickChipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  quickChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickChipTextActive: {
    color: colors.accentDark,
    fontWeight: "600",
  },
});
