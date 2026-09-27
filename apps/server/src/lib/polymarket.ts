// Polymarket is an on-chain prediction market (Polygon), so its market
// prices and volumes are public data — no API key needed. We use the
// public gamma-api, which serves "events" (a game/matchup) each containing
// one or more binary "markets" (Yes/No outcomes with a live price = implied
// probability).
import type { GameProps, OddsEvent, OddsOutcome, PropCategory, PropLine } from "./types";
import type { NflTeam } from "./nflTeams";

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

// Words that mark an event as a season-long future (a division/series
// winner, an award, a championship) rather than a single upcoming game —
// these share Polymarket's team-vs-team title shape, so team-name matching
// alone can't tell them apart. "vspt" shows up in Polymarket's own slugs
// for these (e.g. "cardinals-vspt-49ers-season-series-winner").
const FUTURES_KEYWORDS = [
  "season series",
  "series winner",
  "champion",
  "mvp",
  "make the playoffs",
  "playoffs",
  "award",
  "coach of the year",
  "draft",
  "division winner",
  "conference winner",
  "super bowl winner",
  "total wins",
  "vspt",
];

// Words that mark a market as a prop bet (player stats, total points, a
// specific quarter) rather than the game's moneyline, even when an event
// otherwise looks like a normal upcoming game.
const PROP_KEYWORDS = [
  "props",
  "prop",
  "total points",
  "spread",
  "anytime",
  "touchdown scorer",
  "passing yards",
  "rushing yards",
  "receiving yards",
  "field goal",
  "quarter",
  " half",
  "first score",
  "to score",
];

function includesAny(text: string, keywords: string[]): boolean {
  const norm = text.toLowerCase();
  return keywords.some((k) => norm.includes(k));
}

// Real weekly games close within days; season-long futures close at the
// end of the season, months out. Anything further than ~9 days away is
// treated as a future, not this week's slate.
function isFarFuture(endDate: string | undefined): boolean {
  if (!endDate) return false;
  const end = new Date(endDate).getTime();
  if (Number.isNaN(end)) return false;
  return end - Date.now() > 9 * 24 * 60 * 60 * 1000;
}

/** Picks the market that represents the game's moneyline, not a prop bet, out of everything bundled under one event. */
function pickMoneylineMarket(raw: RawEvent): RawMarket | undefined {
  const candidates = (raw.markets ?? []).filter((m) => parseJsonArray(m.outcomePrices).length > 0);
  if (candidates.length === 0) return undefined;
  const nonProps = candidates.filter((m) => !includesAny(m.question ?? "", PROP_KEYWORDS));
  return nonProps[0] ?? candidates[0];
}

function mapEvent(raw: RawEvent, sport: string): OddsEvent | null {
  const id = raw.id ?? raw.slug;
  if (!id || !raw.title) return null;
  if (includesAny(`${raw.title} ${raw.slug ?? ""}`, FUTURES_KEYWORDS)) return null;
  if (includesAny(raw.slug ?? "", PROP_KEYWORDS)) return null;
  if (isFarFuture(raw.endDate)) return null;

  const market = pickMoneylineMarket(raw);
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

async function fetchPolymarketRawEvents(tag: string): Promise<RawEvent[]> {
  const url = `${GAMMA_API}/events?tag_slug=${tag}&active=true&closed=false&limit=50&order=volume&ascending=false`;
  const res = await fetch(url, { headers: { accept: "application/json" }, next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Polymarket ${res.status}`);

  const body = (await res.json()) as RawEvent[];
  if (!Array.isArray(body)) throw new Error("Unexpected Polymarket response shape");
  return body;
}

export async function fetchPolymarketEvents(sport: string): Promise<OddsEvent[]> {
  const tag = POLYMARKET_SPORT_TAGS[sport];
  if (!tag) return [];

  const body = await fetchPolymarketRawEvents(tag);
  return body.map((e) => mapEvent(e, sport)).filter((e): e is OddsEvent => e !== null);
}

// Player-prop question patterns. Unlike the moneyline, we don't try to
// parse out a player's name or team — the market's own question already
// names the player (e.g. "Josh Allen Over 275.5 Passing Yards?"), and we
// have no roster database to reliably say which of the two teams they're
// on, so props are returned as one list for the game rather than split
// per team.
const CATEGORY_PATTERNS: [PropCategory, RegExp][] = [
  [ "anytimeTd", /anytime touchdown|to score a touchdown/i ],
  [ "passing", /passing yards/i ],
  [ "rushing", /rushing yards/i ],
  [ "receiving", /receiv\w* yards/i ],
];
const LINE_NUMBER_RE = /(\d+(?:\.\d+)?)/;

function extractPropLine(market: RawMarket, eventUrl: string, category: PropCategory): PropLine | null {
  const names = parseJsonArray(market.outcomes);
  const prices = parseJsonArray(market.outcomePrices).map(Number);
  if (names.length === 0 || prices.length !== names.length) return null;

  const overIndex = names.findIndex((n) => /^(over|yes)$/i.test(n.trim()));
  const overProbability = overIndex !== -1 ? prices[overIndex] : null;
  // Anytime-TD markets are a plain Yes/No with no yardage threshold —
  // don't scan for a stray number in the question text.
  const lineMatch = category === "anytimeTd" ? null : (market.question ?? "").match(LINE_NUMBER_RE);

  return {
    label: market.question ?? "Prop",
    line: lineMatch ? Number(lineMatch[1]) : null,
    overProbability,
    sourceUrl: eventUrl,
  };
}

function eventMentionsBothTeams(raw: RawEvent, teamA: NflTeam, teamB: NflTeam): boolean {
  const text = `${raw.title ?? ""} ${raw.slug ?? ""}`.toLowerCase();
  return text.includes(teamA.mascot.toLowerCase()) && text.includes(teamB.mascot.toLowerCase());
}

const CATEGORY_CAP: Record<PropCategory, number> = {
  anytimeTd: 12,
  passing: 6,
  rushing: 10,
  receiving: 12,
};

/**
 * Anytime-touchdown, passing/rushing/receiving-yards prop lines for one
 * game, bucketed by category. Polymarket sometimes splits a game's props
 * into a separate "event" from its moneyline (e.g. a "-player-props"
 * suffixed one), so this scans every event mentioning both teams, not
 * just the one mapEvent picked.
 */
export async function fetchPolymarketGameProps(sport: string, teamA: NflTeam, teamB: NflTeam): Promise<GameProps> {
  const result: GameProps = { anytimeTd: [], passing: [], rushing: [], receiving: [] };

  const tag = POLYMARKET_SPORT_TAGS[sport];
  if (!tag) return result;

  const events = await fetchPolymarketRawEvents(tag);
  const matching = events.filter((e) => eventMentionsBothTeams(e, teamA, teamB));

  for (const event of matching) {
    const eventUrl = `https://polymarket.com/event/${event.slug ?? event.id}`;
    for (const market of event.markets ?? []) {
      const question = market.question ?? "";
      const category = CATEGORY_PATTERNS.find(([, re]) => re.test(question))?.[0];
      if (!category) continue;
      const line = extractPropLine(market, eventUrl, category);
      if (line) result[category].push(line);
    }
  }

  for (const category of Object.keys(result) as PropCategory[]) {
    result[category] = result[category].slice(0, CATEGORY_CAP[category]);
  }
  return result;
}
