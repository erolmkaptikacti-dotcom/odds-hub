// Charcoal-grey theme — no color accents, just grey/white and typography/
// spacing to carry hierarchy. Uses each platform's own default system font
// (San Francisco on iOS, Roboto on Android) rather than Helvetica Neue —
// it's what most modern fintech/prediction apps actually render in, and it
// reads noticeably less "stiff" than Helvetica at the same sizes. Zero
// extra dependencies (no font files to bundle, no version drift to manage).
import { Platform } from "react-native";

export const colors = {
  bg: "#141416",
  surface: "#1c1c1f",
  surfaceRaised: "#26262a",
  border: "rgba(255,255,255,0.12)",
  borderStrong: "rgba(255,255,255,0.35)",
  textPrimary: "#f2f2f3",
  textSecondary: "#a9a9ad",
  textMuted: "#75757a",
  invertedBg: "#f2f2f3",
  invertedText: "#141416",
  error: "#f2f2f3", // errors stay monochrome too; weight/emphasis carries urgency
};

export const font = undefined; // platform default: San Francisco (iOS) / Roboto (Android)

export const fontMedium = Platform.select({
  ios: undefined, // San Francisco already has a clean medium weight via fontWeight
  android: "sans-serif-medium",
  default: undefined,
});
