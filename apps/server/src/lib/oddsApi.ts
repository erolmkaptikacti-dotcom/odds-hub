// Bet365 (like FanDuel/DraftKings) is a licensed sportsbook, not an
// exchange — it publishes nothing for third parties to read directly.
// The Odds API (the-odds-api.com) is a paid/free-tier aggregator that
// polls bookmakers including bet365 and re-serves their odds in one
// format. Requires an API key (ODDS_API_KEY) — sign up free at
// the-odds-api.com. Without a key set, this simply returns no events,
// same as any other misconfigured source, and the caller falls back to
// demo data.
import type { OddsEvent, OddsOutcome } from "./types";

const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

// The Odds API's own sport keys. Soccer has many separate leagues (each
// its own key) — starting with the Premier League; add more here as
// wanted (e.g. "soccer_spain_la_liga", "soccer_uefa_champs_league").
const ODDS_API_SPORT_KEYS: Record<string, string> = {
  soccer: "soccer_epl",
};

interface RawOutcome {
  name: string;
  price: number; // decimal odds, e.g. 2.5
}

interface RawMarket {
  key: string; // "h2h" = moneyline/match-winner
  outcomes: RawOutcome[];
}

interface RawBookmaker {
  key: string; // e.g. "bet365"
  markets: RawMarket[];
}

interface RawEvent {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: RawBookmaker[];
}

/** Decimal odds -> implied probability (no de-vig; same "implied, not fair" convention used elsewhere in this app). */
function decimalToProbability(price: number): number {
  return price > 0 ? 1 / price : 0;
}

function mapEvent(raw: RawEvent, sport: string): OddsEvent | null {
  const book = raw.bookmakers?.find((b) => b.key === "bet365");
  const market = book?.markets?.find((m) => m.key === "h2h");
  if (!market || market.outcomes.length === 0) return null;

  const outcomes: OddsOutcome[] = market.outcomes.map((o) => ({
    name: o.name,
    impliedProbability: decimalToProbability(o.price),
  }));

  return {
    id: `bet365:${raw.id}`,
    source: "bet365",
    sport,
    title: `${raw.home_team} vs ${raw.away_team}`,
    outcomes,
    volume: 0, // sportsbooks don't expose a trading-volume figure the way prediction markets do
    closeTime: raw.commence_time ?? null,
    sourceUrl: "https://www.bet365.com/",
  };
}

export async function fetchBet365Events(sport: string): Promise<OddsEvent[]> {
  const apiKey = process.env.ODDS_API_KEY;
  const sportKey = ODDS_API_SPORT_KEYS[sport];
  if (!apiKey || !sportKey) return [];

  const url = `${ODDS_API_BASE}/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=uk&markets=h2h&oddsFormat=decimal`;
  const res = await fetch(url, { headers: { accept: "application/json" }, next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`The Odds API ${res.status}`);

  const body = (await res.json()) as RawEvent[];
  if (!Array.isArray(body)) throw new Error("Unexpected Odds API response shape");

  return body.map((e) => mapEvent(e, sport)).filter((e): e is OddsEvent => e !== null);
}
