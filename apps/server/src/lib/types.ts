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

// A single real-world game's moneyline, with each source's implied
// probability lined up side by side under the same two teams — this is
// what /api/games returns, as opposed to /api/events' one-card-per-source
// list. Season-long futures never make it into this shape (see
// matchGameTeams in nflTeams.ts): only markets naming exactly two teams do.
export interface GameSourceOdds {
  teamAProbability: number | null;
  teamBProbability: number | null;
  sourceUrl: string;
}

export interface GameOdds {
  id: string;
  sport: string;
  teamA: string;
  teamB: string;
  kickoff: string | null; // ISO timestamp, best-effort (market close time)
  polymarket: GameSourceOdds | null;
  kalshi: GameSourceOdds | null;
}

export interface GamesResponse {
  games: GameOdds[];
  demo: boolean;
  reason?: string;
  updatedAt: number;
}
