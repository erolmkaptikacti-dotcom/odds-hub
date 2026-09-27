// Kalshi is a CFTC-regulated prediction market exchange. Its market data
// (order book, last price, volume) is public and keyless for reading —
// only placing real trades needs an account/API key, which this app never
// does.
import type { OddsEvent, OddsOutcome } from "./types";

const KALSHI_API = "https://api.elections.kalshi.com/trade-api/v2";

// Kalshi groups markets under an "event_ticker" (one game) and a
// "series_ticker" (one league). Series tickers are stable identifiers set
// by Kalshi, not slugs we can guess, so we keep an explicit map.
export const KALSHI_SPORT_SERIES: Record<string, string[]> = {
  nfl: ["KXNFLGAME"],
  nba: ["KXNBAGAME"],
  mlb: ["KXMLBGAME"],
  nhl: ["KXNHLGAME"],
};

interface RawMarket {
  ticker?: string;
  event_ticker?: string;
  title?: string;
  subtitle?: string;
  yes_bid?: number; // cents, 0..100
  yes_ask?: number;
  last_price?: number;
  volume?: number;
  close_time?: string;
}

interface RawMarketsResponse {
  markets?: RawMarket[];
}

function centsToProbability(cents: number | undefined): number | null {
  if (typeof cents !== "number" || cents <= 0) return null;
  return cents / 100;
}

// Kalshi's game markets are per-team binary contracts (e.g. "Chiefs win
// YES/NO"), one market per side, sharing an event_ticker. We group by
// event_ticker so each game becomes one OddsEvent with a Yes-price outcome
// per team.
function mapMarketsToEvents(markets: RawMarket[], sport: string): OddsEvent[] {
  const byEvent = new Map<string, RawMarket[]>();
  for (const m of markets) {
    if (!m.event_ticker) continue;
    const group = byEvent.get(m.event_ticker) ?? [];
    group.push(m);
    byEvent.set(m.event_ticker, group);
  }

  const events: OddsEvent[] = [];
  for (const [eventTicker, group] of byEvent) {
    const outcomes: OddsOutcome[] = [];
    let volume = 0;
    let closeTime: string | null = null;
    let title = eventTicker;

    for (const m of group) {
      const prob = centsToProbability(m.last_price ?? m.yes_bid ?? m.yes_ask);
      if (prob === null) continue;
      outcomes.push({ name: m.subtitle ?? m.title ?? m.ticker ?? "Yes", impliedProbability: prob });
      volume += m.volume ?? 0;
      if (m.close_time) closeTime = m.close_time;
      if (m.title) title = m.title;
    }

    if (outcomes.length === 0) continue;

    events.push({
      id: `kalshi:${eventTicker}`,
      source: "kalshi",
      sport,
      title,
      outcomes,
      volume,
      closeTime,
      sourceUrl: `https://kalshi.com/markets/${eventTicker.toLowerCase()}`,
    });
  }

  return events;
}

export async function fetchKalshiEvents(sport: string): Promise<OddsEvent[]> {
  const seriesList = KALSHI_SPORT_SERIES[sport];
  if (!seriesList) return [];

  const all: RawMarket[] = [];
  for (const series of seriesList) {
    const url = `${KALSHI_API}/markets?series_ticker=${series}&status=open&limit=100`;
    const res = await fetch(url, { headers: { accept: "application/json" }, next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`Kalshi ${res.status}`);
    const body = (await res.json()) as RawMarketsResponse;
    if (Array.isArray(body.markets)) all.push(...body.markets);
  }

  return mapMarketsToEvents(all, sport);
}
