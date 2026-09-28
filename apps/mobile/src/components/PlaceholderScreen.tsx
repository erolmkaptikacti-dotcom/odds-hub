import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontMedium } from "@/theme";

/** Simple centered icon+message screen — used for tabs (Live, Account, Settings) that don't have real content wired up yet. */
export function PlaceholderScreen({
  icon,
  title,
  message,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={40} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 32,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: fontMedium,
  },
  message: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fontMedium,
    textAlign: "center",
  },
});
