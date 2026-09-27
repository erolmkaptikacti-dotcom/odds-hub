// Used to identify which real-world game a market is about, and to match
// the same game across Polymarket and Kalshi even though their titles and
// outcome labels are phrased differently. Matching on mascot first (most
// specific) avoids ambiguity between the two New York teams and the two
// LA teams, which share a city name.
import type { OddsEvent } from "./types";

export interface NflTeam {
  city: string;
  mascot: string;
  abbr: string;
  name: string; // "Kansas City Chiefs"
  aliases?: string[]; // extra labels a source might use, e.g. Kalshi's truncated "Los Angeles C"
}

export const NFL_TEAMS: NflTeam[] = [
  { city: "Arizona", mascot: "Cardinals", abbr: "ARI", name: "Arizona Cardinals" },
  { city: "Atlanta", mascot: "Falcons", abbr: "ATL", name: "Atlanta Falcons" },
  { city: "Baltimore", mascot: "Ravens", abbr: "BAL", name: "Baltimore Ravens" },
  { city: "Buffalo", mascot: "Bills", abbr: "BUF", name: "Buffalo Bills" },
  { city: "Carolina", mascot: "Panthers", abbr: "CAR", name: "Carolina Panthers" },
  { city: "Chicago", mascot: "Bears", abbr: "CHI", name: "Chicago Bears" },
  { city: "Cincinnati", mascot: "Bengals", abbr: "CIN", name: "Cincinnati Bengals" },
  { city: "Cleveland", mascot: "Browns", abbr: "CLE", name: "Cleveland Browns" },
  { city: "Dallas", mascot: "Cowboys", abbr: "DAL", name: "Dallas Cowboys" },
  { city: "Denver", mascot: "Broncos", abbr: "DEN", name: "Denver Broncos" },
  { city: "Detroit", mascot: "Lions", abbr: "DET", name: "Detroit Lions" },
  { city: "Green Bay", mascot: "Packers", abbr: "GB", name: "Green Bay Packers" },
  { city: "Houston", mascot: "Texans", abbr: "HOU", name: "Houston Texans" },
  { city: "Indianapolis", mascot: "Colts", abbr: "IND", name: "Indianapolis Colts" },
  { city: "Jacksonville", mascot: "Jaguars", abbr: "JAX", name: "Jacksonville Jaguars" },
  { city: "Kansas City", mascot: "Chiefs", abbr: "KC", name: "Kansas City Chiefs" },
  { city: "Los Angeles", mascot: "Chargers", abbr: "LAC", name: "LA Chargers", aliases: ["los angeles c"] },
  { city: "Los Angeles", mascot: "Rams", abbr: "LAR", name: "LA Rams", aliases: ["los angeles r"] },
  { city: "Las Vegas", mascot: "Raiders", abbr: "LV", name: "Las Vegas Raiders" },
  { city: "Miami", mascot: "Dolphins", abbr: "MIA", name: "Miami Dolphins" },
  { city: "Minnesota", mascot: "Vikings", abbr: "MIN", name: "Minnesota Vikings" },
  { city: "New England", mascot: "Patriots", abbr: "NE", name: "New England Patriots" },
  { city: "New Orleans", mascot: "Saints", abbr: "NO", name: "New Orleans Saints" },
  { city: "New York", mascot: "Giants", abbr: "NYG", name: "New York Giants" },
  { city: "New York", mascot: "Jets", abbr: "NYJ", name: "New York Jets" },
  { city: "Philadelphia", mascot: "Eagles", abbr: "PHI", name: "Philadelphia Eagles" },
  { city: "Pittsburgh", mascot: "Steelers", abbr: "PIT", name: "Pittsburgh Steelers" },
  { city: "Seattle", mascot: "Seahawks", abbr: "SEA", name: "Seattle Seahawks" },
  { city: "San Francisco", mascot: "49ers", abbr: "SF", name: "San Francisco 49ers" },
  { city: "Tampa Bay", mascot: "Buccaneers", abbr: "TB", name: "Tampa Bay Buccaneers" },
  { city: "Tennessee", mascot: "Titans", abbr: "TEN", name: "Tennessee Titans" },
  { city: "Washington", mascot: "Commanders", abbr: "WAS", name: "Washington Commanders" },
];

/**
 * Finds the single NFL team a short string (an outcome label, a title)
 * refers to. Checks most-specific first: mascot ("Saints") beats
 * abbreviation beats a source-specific alias beats a bare city name, since
 * city alone is ambiguous for the two New York and two LA teams.
 */
export function findTeam(text: string): NflTeam | null {
  const norm = text.toLowerCase();
  for (const t of NFL_TEAMS) {
    if (norm.includes(t.mascot.toLowerCase())) return t;
  }
  for (const t of NFL_TEAMS) {
    if (new RegExp(`\\b${t.abbr.toLowerCase()}\\b`).test(norm)) return t;
  }
  for (const t of NFL_TEAMS) {
    if (t.aliases?.some((a) => norm.includes(a))) return t;
  }
  for (const t of NFL_TEAMS) {
    if (norm.includes(t.city.toLowerCase())) return t;
  }
  return null;
}

/** Finds the (up to) two teams named anywhere in a title, in the order they appear. */
function extractTeamsFromTitle(title: string): [NflTeam, NflTeam] | null {
  const norm = title.toLowerCase();
  const found: { team: NflTeam; index: number }[] = [];
  for (const t of NFL_TEAMS) {
    const idx = norm.indexOf(t.mascot.toLowerCase());
    if (idx !== -1) found.push({ team: t, index: idx });
  }
  if (found.length < 2) return null;
  found.sort((a, b) => a.index - b.index);
  const [a, b] = found;
  if (a.team.abbr === b.team.abbr) return null;
  return [a.team, b.team];
}

/**
 * Identifies the two teams a moneyline-shaped event is about. This is also
 * the filter that separates real games from season-long futures/props:
 * a future like "Will the Chiefs make the playoffs?" only names one team
 * and so is correctly rejected here (returns null), while a per-game
 * moneyline market names exactly two.
 */
export function matchGameTeams(event: OddsEvent): [NflTeam, NflTeam] | null {
  if (event.outcomes.length !== 2) return null;
  const a = findTeam(event.outcomes[0].name);
  const b = findTeam(event.outcomes[1].name);
  if (a && b && a.abbr !== b.abbr) return [a, b];
  return extractTeamsFromTitle(event.title);
}
