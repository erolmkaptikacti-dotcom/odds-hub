// William Hill (like FanDuel/DraftKings/bet365) is a licensed sportsbook,
// not an exchange — it publishes nothing for third parties to read
// directly. The Odds API (the-odds-api.com) is a paid/free-tier
// aggregator that polls many UK bookmakers and re-serves their odds in
// one format. We originally tried bet365 specifically, but confirmed
// against a live response that bet365 isn't in The Odds API's bookmaker
// list at all (they're notoriously resistant to third-party odds
// scraping) — William Hill is, consistently. Requires an API key
// (ODDS_API_KEY) — sign up free at the-odds-api.com. Without a key set,
// this simply returns no events, same as any other misconfigured source,
// and the caller falls back to demo data.
import type { OddsEvent, OddsOutcome } from "./types";
import { leagueById } from "./soccerLeagues";

const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

// The Odds API's bookmaker key for William Hill.
const BOOKMAKER_KEY = "williamhill";

interface RawOutcome {
  name: string;
  price: number; // decimal odds, e.g. 2.5
}

interface RawMarket {
  key: string; // "h2h" = moneyline/match-winner
  outcomes: RawOutcome[];
}

interface RawBookmaker {
  key: string; // e.g. "williamhill"
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
  const book = raw.bookmakers?.find((b) => b.key === BOOKMAKER_KEY);
  const market = book?.markets?.find((m) => m.key === "h2h");
  if (!market || market.outcomes.length === 0) return null;

  const outcomes: OddsOutcome[] = market.outcomes.map((o) => ({
    name: o.name,
    impliedProbability: decimalToProbability(o.price),
  }));

  return {
    id: `williamhill:${raw.id}`,
    source: "williamhill",
    sport,
    title: `${raw.home_team} vs ${raw.away_team}`,
    outcomes,
    volume: 0, // sportsbooks don't expose a trading-volume figure the way prediction markets do
    closeTime: raw.commence_time ?? null,
    sourceUrl: "https://www.williamhill.com/",
  };
}

export async function fetchWilliamHillEvents(sport: string, leagueId: string | null): Promise<OddsEvent[]> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey || sport !== "soccer") return [];
  const sportKey = leagueById(leagueId).oddsApiKey;

  const url = `${ODDS_API_BASE}/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=uk&markets=h2h&oddsFormat=decimal`;
  const res = await fetch(url, { headers: { accept: "application/json" }, next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`The Odds API ${res.status}`);

  const body = (await res.json()) as RawEvent[];
  if (!Array.isArray(body)) throw new Error("Unexpected Odds API response shape");

  return body.map((e) => mapEvent(e, sport)).filter((e): e is OddsEvent => e !== null);
}
