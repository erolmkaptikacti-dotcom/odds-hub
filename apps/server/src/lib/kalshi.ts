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

// Kalshi's real field names, confirmed against a live response — prices
// come back as dollar-denominated strings ("0.6100"), not integer cents,
// and the team label lives in yes_sub_title, not "subtitle".
interface RawMarket {
  ticker?: string;
  event_ticker?: string;
  title?: string; // e.g. "New Orleans wins"
  yes_sub_title?: string; // e.g. "New Orleans" — the team this contract pays out on
  last_price_dollars?: string;
  yes_bid_dollars?: string;
  yes_ask_dollars?: string;
  volume_fp?: string;
  close_time?: string;
}

interface RawMarketsResponse {
  markets?: RawMarket[];
}

function parseDollars(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** A market's implied probability: last traded price, falling back to the bid/ask midpoint. */
function impliedProbability(m: RawMarket): number | null {
  const last = parseDollars(m.last_price_dollars);
  if (last !== null) return last;
  const bid = parseDollars(m.yes_bid_dollars);
  const ask = parseDollars(m.yes_ask_dollars);
  if (bid !== null && ask !== null) return (bid + ask) / 2;
  return bid ?? ask;
}

// Kalshi's per-game markets are one binary contract per team ("<Team>
// wins", Yes/No), sharing an event_ticker — we group by event_ticker so
// each game becomes one OddsEvent with one outcome per team.
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

    for (const m of group) {
      const prob = impliedProbability(m);
      if (prob === null) continue;
      const teamLabel = m.yes_sub_title ?? m.title ?? m.ticker ?? "Yes";
      outcomes.push({ name: teamLabel, impliedProbability: prob });
      volume += parseDollars(m.volume_fp) ?? 0;
      if (m.close_time) closeTime = m.close_time;
    }

    if (outcomes.length === 0) continue;

    events.push({
      id: `kalshi:${eventTicker}`,
      source: "kalshi",
      sport,
      title: outcomes.map((o) => o.name).join(" vs "),
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
    const url = `${KALSHI_API}/markets?series_ticker=${series}&status=open&limit=200`;
    const res = await fetch(url, { headers: { accept: "application/json" }, next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`Kalshi ${res.status}`);
    const body = (await res.json()) as RawMarketsResponse;
    if (Array.isArray(body.markets)) all.push(...body.markets);
  }

  return mapMarketsToEvents(all, sport);
}
