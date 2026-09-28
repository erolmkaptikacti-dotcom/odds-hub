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

// Sports with a team-name dictionary on the server (apps/server/src/lib),
// so /api/games can match the same game across Polymarket and Kalshi.
// Everything else falls back to the per-source event list.
export const GAME_MATCHING_SPORTS = new Set(["nfl"]);

// Mirrors apps/server/src/lib/soccerLeagues.ts's ids — only the William
// Hill side of the feed actually changes per league (Polymarket already
// returns every competition under one "soccer" tag).
export const SOCCER_LEAGUES = [
  { id: "epl", label: "Premier League" },
  { id: "laliga", label: "La Liga" },
  { id: "bundesliga", label: "Bundesliga" },
  { id: "seriea", label: "Serie A" },
  { id: "ligue1", label: "Ligue 1" },
  { id: "ucl", label: "Champions League" },
  { id: "mls", label: "MLS" },
  { id: "nations", label: "Nations League" },
] as const;

