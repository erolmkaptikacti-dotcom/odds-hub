// Which league is selected changes which league William Hill (via The
// Odds API) fetches — that's a real per-league API call, so it's
// accurate for every league whose oddsApiKey is right. Polymarket is
// different: its tag_slug=soccer fetch returns every competition in one
// call, with no separate "league" field — the only thing distinguishing
// leagues is each event's slug. We've only confirmed two slug prefixes
// against real data: "unl-" for Nations League and "mls-" for MLS (both
// seen directly in a live response). For every other league,
// polymarketSlugPrefixes is left unset — filtering on a guessed prefix
// would silently hide real games that just happen to be worded
// differently, which is worse than not filtering at all, so those
// leagues show Polymarket's full unfiltered soccer list instead.
//
// The Odds API sport_keys below follow their documented naming
// convention but, like Kalshi's series tickers before them, are
// unverified against a real response for every league except soccer_epl
// (confirmed) — an unverified one simply returns no events and falls
// back to demo data like any other source, so a wrong guess degrades
// safely rather than breaking anything.
export interface SoccerLeague {
  id: string;
  label: string;
  oddsApiKey: string;
  polymarketSlugPrefixes?: string[];
}

export const SOCCER_LEAGUES: SoccerLeague[] = [
  { id: "epl", label: "Premier League", oddsApiKey: "soccer_epl" },
  { id: "laliga", label: "La Liga", oddsApiKey: "soccer_spain_la_liga" },
  { id: "bundesliga", label: "Bundesliga", oddsApiKey: "soccer_germany_bundesliga" },
  { id: "seriea", label: "Serie A", oddsApiKey: "soccer_italy_serie_a" },
  { id: "ligue1", label: "Ligue 1", oddsApiKey: "soccer_france_ligue_one" },
  { id: "ucl", label: "Champions League", oddsApiKey: "soccer_uefa_champs_league" },
  { id: "mls", label: "MLS", oddsApiKey: "soccer_usa_mls", polymarketSlugPrefixes: ["mls-"] },
  { id: "nations", label: "Nations League", oddsApiKey: "soccer_uefa_nations_league", polymarketSlugPrefixes: ["unl-"] },
];

export const DEFAULT_LEAGUE_ID = "epl";

export function leagueById(id: string | null): SoccerLeague {
  return SOCCER_LEAGUES.find((l) => l.id === id) ?? SOCCER_LEAGUES.find((l) => l.id === DEFAULT_LEAGUE_ID)!;
}
