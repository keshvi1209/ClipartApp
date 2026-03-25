import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";

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
    backgroundColor: "#13131A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E1E2A",
    overflow: "hidden",
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
    color: "#A78BFA",
  },
  toggleSub: {
    fontSize: 11,
    color: "#6B7280",
  },
  editorBody: {
    borderTopWidth: 1,
    borderColor: "#1E1E2A",
    padding: 14,
    gap: 10,
  },
  input: {
    backgroundColor: "#0A0A0F",
    borderRadius: 10,
    padding: 12,
    color: "#F1F0FF",
    fontSize: 14,
    minHeight: 70,
    borderWidth: 1,
    borderColor: "#1E1E2A",
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 11,
    color: "#4B5563",
    textAlign: "right",
  },
  quickLabel: {
    fontSize: 11,
    color: "#6B7280",
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
    backgroundColor: "#1E1E2A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#2A2A3A",
  },
  quickChipActive: {
    backgroundColor: "#7C3AED22",
    borderColor: "#7C3AED",
  },
  quickChipText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  quickChipTextActive: {
    color: "#A78BFA",
    fontWeight: "600",
  },
});
