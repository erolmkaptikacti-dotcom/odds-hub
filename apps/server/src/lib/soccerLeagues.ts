// Which league is selected changes which league William Hill (via The
// Odds API) fetches — a real separate API call per league, so it's
// accurate for every league whose oddsApiKey is right. Polymarket is
// different: its tag_slug=soccer fetch returns every competition in one
// call with no separate "league" field, so we classify each event
// ourselves from its title (reliably "Team A vs Team B" in real data) by
// checking both team names against a league's roster. Nations League and
// MLS use a confirmed slug prefix instead (seen directly in live data:
// "unl-", "mls-") since matching on country/franchise names there is
// simpler and more reliable than a club roster. Champions League checks
// the title/slug for its own name instead of a roster, since it draws
// clubs from every domestic league below and a roster can't tell it
// apart from a domestic match between the same two clubs.
//
// The domestic rosters are current as of the last time this list was
// written and aren't guaranteed to track mid-season transfers or
// promotion/relegation — a team that's missing just won't be filtered
// into that league (it keeps showing up when no league is selected,
// since only Polymarket's *filtering* depends on this list, not fetching
// it in the first place).
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
  polymarketTeams?: string[];
  polymarketTitleKeywords?: string[];
}

const EPL_TEAMS = [
  "Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton", "Burnley",
  "Chelsea", "Crystal Palace", "Everton", "Fulham", "Leeds United", "Liverpool",
  "Manchester City", "Manchester United", "Newcastle United", "Nottingham Forest",
  "Sunderland", "Tottenham", "West Ham", "Wolverhampton", "Wolves",
];

const LA_LIGA_TEAMS = [
  "Real Madrid", "Barcelona", "Atletico Madrid", "Sevilla", "Real Sociedad",
  "Real Betis", "Villarreal", "Athletic Bilbao", "Valencia", "Celta Vigo",
  "Getafe", "Osasuna", "Rayo Vallecano", "Mallorca", "Girona", "Las Palmas",
  "Alaves", "Espanyol", "Leganes", "Valladolid", "Elche",
];

const BUNDESLIGA_TEAMS = [
  "Bayern Munich", "Borussia Dortmund", "RB Leipzig", "Bayer Leverkusen",
  "Eintracht Frankfurt", "Wolfsburg", "Borussia Monchengladbach", "Union Berlin",
  "Freiburg", "Mainz", "Hoffenheim", "Werder Bremen", "Augsburg", "Stuttgart",
  "Heidenheim", "Bochum", "Holstein Kiel", "St Pauli", "Cologne",
];

const SERIE_A_TEAMS = [
  "Juventus", "Inter Milan", "AC Milan", "Napoli", "Roma", "Lazio", "Atalanta",
  "Fiorentina", "Bologna", "Torino", "Udinese", "Sassuolo", "Genoa", "Cagliari",
  "Verona", "Empoli", "Lecce", "Parma", "Como", "Venezia", "Pisa", "Cremonese",
];

const LIGUE_1_TEAMS = [
  "Paris Saint-Germain", "PSG", "Marseille", "Lyon", "Monaco", "Lille", "Rennes",
  "Nice", "Lens", "Nantes", "Strasbourg", "Toulouse", "Montpellier", "Reims",
  "Brest", "Le Havre", "Angers", "Auxerre", "Saint-Etienne", "Metz", "Paris FC",
];

export const SOCCER_LEAGUES: SoccerLeague[] = [
  { id: "epl", label: "Premier League", oddsApiKey: "soccer_epl", polymarketTeams: EPL_TEAMS },
  { id: "laliga", label: "La Liga", oddsApiKey: "soccer_spain_la_liga", polymarketTeams: LA_LIGA_TEAMS },
  { id: "bundesliga", label: "Bundesliga", oddsApiKey: "soccer_germany_bundesliga", polymarketTeams: BUNDESLIGA_TEAMS },
  { id: "seriea", label: "Serie A", oddsApiKey: "soccer_italy_serie_a", polymarketTeams: SERIE_A_TEAMS },
  { id: "ligue1", label: "Ligue 1", oddsApiKey: "soccer_france_ligue_one", polymarketTeams: LIGUE_1_TEAMS },
  {
    id: "ucl",
    label: "Champions League",
    oddsApiKey: "soccer_uefa_champs_league",
    polymarketTitleKeywords: ["champions league", "ucl"],
  },
  { id: "mls", label: "MLS", oddsApiKey: "soccer_usa_mls", polymarketSlugPrefixes: ["mls-"] },
  { id: "nations", label: "Nations League", oddsApiKey: "soccer_uefa_nations_league", polymarketSlugPrefixes: ["unl-"] },
];

export const DEFAULT_LEAGUE_ID = "epl";

export function leagueById(id: string | null): SoccerLeague {
  return SOCCER_LEAGUES.find((l) => l.id === id) ?? SOCCER_LEAGUES.find((l) => l.id === DEFAULT_LEAGUE_ID)!;
}
