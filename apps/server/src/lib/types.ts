// The common shape every source gets normalized into. The mobile app only
// ever talks to /api/events and only ever sees this shape — it never knows
// Polymarket and Kalshi have completely different raw APIs.

export type Source = "polymarket" | "kalshi";

export interface OddsOutcome {
  name: string; // e.g. "Chiefs win", "Yes"
  impliedProbability: number; // 0..1, derived from the market price
}

export interface OddsEvent {
  id: string; // "<source>:<raw id>", globally unique
  source: Source;
  sport: string; // "nfl" | "nba" | "mlb" | "nhl" | "soccer" | ...
  title: string; // "Chiefs vs Bills"
  outcomes: OddsOutcome[];
  volume: number; // USD traded, 0 if unknown
  closeTime: string | null; // ISO timestamp, null if unknown
  sourceUrl: string; // link back to the original market
}

export interface EventsResponse {
  events: OddsEvent[];
  demo: boolean;
  reason?: string;
  updatedAt: number;
}
