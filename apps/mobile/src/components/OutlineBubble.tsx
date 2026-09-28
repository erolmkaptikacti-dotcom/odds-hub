import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontMedium } from "@/theme";

// React Native's Text has no native stroke/outline property, so the
// "hollow" letters (filled the same color as the page background, with a
// teal outline) are faked the classic way: several copies of the same
// text in teal, nudged a pixel in every direction, stacked behind the
// real text — the teal peeks out around each letter's edges like a
// stroke, while the top layer (colored to match the page) reads as
// "cut out" of it.
const OFFSETS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
] as const;

function OutlineText({ children }: { children: string }) {
  return (
    <View>
      {OFFSETS.map(([dx, dy], i) => (
        <Text
          key={i}
          style={[styles.label, styles.labelStroke, { position: "absolute", left: dx, top: dy }]}
        >
          {children}
        </Text>
      ))}
      <Text style={styles.label}>{children}</Text>
    </View>
  );
}

export function OutlineBubble({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.bubble, active && styles.bubbleActive]}>
      <OutlineText>{label}</OutlineText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.bg,
  },
  bubbleActive: {
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    fontFamily: fontMedium,
    color: colors.bg,
  },
  labelStroke: {
    color: colors.accent,
  },
});
