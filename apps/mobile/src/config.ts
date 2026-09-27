// Points at your locally-running server by default (apps/server, `npm run
// dev`, port 3000). On a physical phone "localhost" means the phone
// itself, not your computer — set EXPO_PUBLIC_API_URL to your computer's
// LAN IP (e.g. http://192.168.1.20:3000) or a deployed server URL instead.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const SPORTS = [
  { key: "nfl", label: "NFL" },
  { key: "nba", label: "NBA" },
  { key: "mlb", label: "MLB" },
  { key: "nhl", label: "NHL" },
  { key: "soccer", label: "Soccer" },
] as const;

export const POLL_INTERVAL_MS = 30_000;
