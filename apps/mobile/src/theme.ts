// Light theme: light-gray surfaces with dark charcoal text for real
// readability, and a teal accent reserved for headers, labels, and active
// states — not for body text/numbers, which need strong contrast to scan
// quickly. Uses each platform's own default system font (San Francisco on
// iOS, Roboto on Android) rather than a bundled one — no extra
// dependencies, no font-version drift to manage.
import { Platform } from "react-native";

export const colors = {
  bg: "#404247",
  surface: "#ffffff",
  surfaceRaised: "#eef0f2",
  border: "rgba(20,20,22,0.12)",
  borderStrong: "rgba(20,20,22,0.28)",
  textPrimary: "#1a1a1e",
  textSecondary: "#5c5c62",
  textMuted: "#8a8a90",
  accent: "#0f9b8e", // teal — headers, active tab, brand labels, section accents
  invertedBg: "#0f9b8e", // active/selected pill fill (teal, not stark invert)
  invertedText: "#ffffff",
  error: "#c0392b",
};

export const font = undefined; // platform default: San Francisco (iOS) / Roboto (Android)

export const fontMedium = Platform.select({
  ios: undefined, // San Francisco already has a clean medium weight via fontWeight
  android: "sans-serif-medium",
  default: undefined,
});
