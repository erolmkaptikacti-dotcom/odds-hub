// Polymarket is an on-chain prediction market (Polygon), so its market
// prices and volumes are public data — no API key needed. We use the
// public gamma-api, which serves "events" (a game/matchup) each containing
// one or more binary "markets" (Yes/No outcomes with a live price = implied
// probability).
import type { OddsEvent, OddsOutcome } from "./types";

const GAMMA_API = "https://gamma-api.polymarket.com";

// Polymarket's sport tag slugs. Not exhaustive — add more as needed.
export const POLYMARKET_SPORT_TAGS: Record<string, string> = {
  nfl: "nfl",
  nba: "nba",
  mlb: "mlb",
  nhl: "nhl",
  soccer: "soccer",
};

interface RawMarket {
  question?: string;
  outcomes?: string; // JSON-encoded string array, e.g. '["Yes","No"]'
  outcomePrices?: string; // JSON-encoded string array, e.g. '["0.62","0.38"]'
  volume?: string | number;
  volumeNum?: number;
}

interface RawEvent {
  id?: string;
  slug?: string;
  title?: string;
  volume?: string | number;
  volumeNum?: number;
  endDate?: string;
  markets?: RawMarket[];
}

function num(v: string | number | undefined): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function mapEvent(raw: RawEvent, sport: string): OddsEvent | null {
  const id = raw.id ?? raw.slug;
  if (!id || !raw.title) return null;

  // A Polymarket "event" can bundle several markets (e.g. multiple prop
  // questions for one game). For the odds view we want the primary
  // moneyline-equivalent market: prefer one whose outcomes look like a
  // binary Yes/No or team-vs-team pick, and that has a price.
  const market = raw.markets?.find((m) => parseJsonArray(m.outcomePrices).length > 0);
  if (!market) return null;

  const names = parseJsonArray(market.outcomes);
  const prices = parseJsonArray(market.outcomePrices).map(Number);
  if (names.length === 0 || prices.length !== names.length) return null;

  const outcomes: OddsOutcome[] = names.map((name, i) => ({
    name,
    impliedProbability: prices[i],
  }));

  return {
    id: `polymarket:${id}`,
    source: "polymarket",
    sport,
    title: raw.title,
    outcomes,
    volume: num(raw.volumeNum ?? raw.volume),
    closeTime: raw.endDate ?? null,
    sourceUrl: `https://polymarket.com/event/${raw.slug ?? id}`,
  };
}

export async function fetchPolymarketEvents(sport: string): Promise<OddsEvent[]> {
  const tag = POLYMARKET_SPORT_TAGS[sport];
  if (!tag) return [];

  const url = `${GAMMA_API}/events?tag_slug=${tag}&active=true&closed=false&limit=50&order=volume&ascending=false`;
  const res = await fetch(url, { headers: { accept: "application/json" }, next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Polymarket ${res.status}`);

  const body = (await res.json()) as RawEvent[];
  if (!Array.isArray(body)) throw new Error("Unexpected Polymarket response shape");

  return body.map((e) => mapEvent(e, sport)).filter((e): e is OddsEvent => e !== null);
}
