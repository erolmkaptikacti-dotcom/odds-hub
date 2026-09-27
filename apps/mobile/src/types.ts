// Mirrors apps/server/src/lib/types.ts — the API contract between the two
// packages. If these drift, the fix is either to keep them in sync by hand
// (fine at this size) or move them into a shared workspace package later.

export type Source = "polymarket" | "kalshi";

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
