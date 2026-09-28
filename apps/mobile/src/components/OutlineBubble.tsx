import { Pressable, StyleSheet, Text } from "react-native";
import { colors, fontMedium } from "@/theme";

// "Hollow" letters — filled to match the page background, with a teal
// glow/outline around each one — using a single Text's textShadow rather
// than stacking several offset copies (which was fragile: it let each
// bubble's measured size balloon unpredictably). A shadow with no offset
// and a small radius reads as an outline hugging the letters, at zero
// layout risk.
export function OutlineBubble({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.bubble, active && styles.bubbleActive]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bubble: {
    flexShrink: 0,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  bubbleActive: {
    borderWidth: 2.5,
  },
  label: {
    fontSize: 17,
    fontWeight: "800",
    fontFamily: fontMedium,
    color: colors.bg,
    textShadowColor: colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2.5,
  },
});
