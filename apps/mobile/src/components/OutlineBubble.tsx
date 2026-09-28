import { Pressable, StyleSheet, Text } from "react-native";
import { colors, fontMedium } from "@/theme";

// White letters with a teal glow/outline around each one — a single
// Text's textShadow (no offset, small radius) rather than stacking
// several offset copies (which was fragile: it let each bubble's
// measured size balloon unpredictably).
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
    fontSize: 19,
    fontWeight: "800",
    fontFamily: fontMedium,
    color: "#ffffff",
    textShadowColor: colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});
