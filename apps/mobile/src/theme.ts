// Monochrome, high-contrast theme — no color accents, just black/white/gray
// and typography/spacing to carry hierarchy. Uses each platform's cleanest
// system sans so we get a professional look with zero extra dependencies
// (no font files to bundle, no version drift to manage).
import { Platform } from "react-native";

export const colors = {
  bg: "#000000",
  surface: "#0d0d0d",
  surfaceRaised: "#161616",
  border: "rgba(255,255,255,0.14)",
  borderStrong: "rgba(255,255,255,0.4)",
  textPrimary: "#ffffff",
  textSecondary: "#b3b3b3",
  textMuted: "#707070",
  invertedBg: "#ffffff",
  invertedText: "#000000",
  error: "#ffffff", // errors stay monochrome too; weight/emphasis carries urgency
};

export const font = Platform.select({
  ios: "Helvetica Neue",
  android: "sans-serif",
  default: "System",
});

export const fontMedium = Platform.select({
  ios: "Helvetica Neue",
  android: "sans-serif-medium",
  default: "System",
});
