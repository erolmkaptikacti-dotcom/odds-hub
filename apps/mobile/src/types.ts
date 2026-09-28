// Mirrors apps/server/src/lib/types.ts — the API contract between the two
// packages. If these drift, the fix is either to keep them in sync by hand
// (fine at this size) or move them into a shared workspace package later.

export type Source = "polymarket" | "kalshi" | "williamhill";

export interface OddsOutcome {
  name: string;
  impliedProbability: number;
}

export interface OddsEvent {
  id: string;
  source: Source;
  sport: string;
  title: string;
  outcomes: OddsOutcome[];
  volume: number;
  closeTime: string | null;
  sourceUrl: string;
}

export interface EventsResponse {
  events: OddsEvent[];
  demo: boolean;
  reason?: string;
  updatedAt: number;
}

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
  kickoff: string | null;
  polymarket: GameSourceOdds | null;
  kalshi: GameSourceOdds | null;
}

export interface GamesResponse {
  games: GameOdds[];
  demo: boolean;
  reason?: string;
  updatedAt: number;
}

export interface PropLine {
  label: string;
  playerName: string;
  line: number | null;
  overProbability: number | null;
  sourceUrl: string;
  headshotUrl?: string;
  team?: string;
}

export type PropCategory = "anytimeTd" | "passing" | "rushing" | "receiving";

export type GameProps = Record<PropCategory, PropLine[]>;

export interface GamePropsResponse {
  gameId: string;
  sport: string;
  teamA: string;
  teamB: string;
  polymarket: GameProps | null;
  kalshi: GameProps | null;
  demo: boolean;
  reason?: string;
  updatedAt: number;
}
