// Which league is selected only changes which league William Hill (via
// The Odds API) fetches — Polymarket's tag_slug=soccer fetch already
// returns every competition it lists (Premier League, Nations League,
// MLS, etc. all came back in one call when we tested this live), so it
// stays unfiltered regardless of league. The Odds API sport_keys below
// follow their documented naming convention but, like Kalshi's series
// tickers before them, are unverified against a real response for every
// league except soccer_epl (which we've confirmed works) — an unverified
// one simply returns no events and falls back to demo data like any
// other source, so a wrong guess here degrades safely rather than
// breaking anything.
export interface SoccerLeague {
  id: string;
  label: string;
  oddsApiKey: string;
}

export const SOCCER_LEAGUES: SoccerLeague[] = [
  { id: "epl", label: "Premier League", oddsApiKey: "soccer_epl" },
  { id: "laliga", label: "La Liga", oddsApiKey: "soccer_spain_la_liga" },
  { id: "bundesliga", label: "Bundesliga", oddsApiKey: "soccer_germany_bundesliga" },
  { id: "seriea", label: "Serie A", oddsApiKey: "soccer_italy_serie_a" },
  { id: "ligue1", label: "Ligue 1", oddsApiKey: "soccer_france_ligue_one" },
  { id: "ucl", label: "Champions League", oddsApiKey: "soccer_uefa_champs_league" },
  { id: "mls", label: "MLS", oddsApiKey: "soccer_usa_mls" },
  { id: "nations", label: "Nations League", oddsApiKey: "soccer_uefa_nations_league" },
];

export const DEFAULT_LEAGUE_ID = "epl";

export function leagueById(id: string | null): SoccerLeague {
  return SOCCER_LEAGUES.find((l) => l.id === id) ?? SOCCER_LEAGUES.find((l) => l.id === DEFAULT_LEAGUE_ID)!;
}
