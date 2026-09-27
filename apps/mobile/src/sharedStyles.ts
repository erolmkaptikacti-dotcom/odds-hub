import { StyleSheet } from "react-native";
import { colors, font } from "@/theme";

// Shared by any per-sport view (GamesView, EventsView, …) so loading/error/
// empty states look identical everywhere.
export const sharedStyles = StyleSheet.create({
  centerBox: {
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: font,
    textAlign: "center",
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontFamily: font,
    fontWeight: "600",
    textAlign: "center",
  },
});
