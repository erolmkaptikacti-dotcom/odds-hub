// Each team's primary color + short abbreviation, used to render a colored
// badge (in place of a licensed team logo) and the split-color card
// border. Keys must match the `name` field the server sends in GameOdds
// (apps/server/src/lib/nflTeams.ts) exactly.
export interface NflTeamStyle {
  abbr: string;
  color: string;
}

export const NFL_TEAM_STYLES: Record<string, NflTeamStyle> = {
  "Arizona Cardinals": { abbr: "ARI", color: "#97233F" },
  "Atlanta Falcons": { abbr: "ATL", color: "#A71930" },
  "Baltimore Ravens": { abbr: "BAL", color: "#241773" },
  "Buffalo Bills": { abbr: "BUF", color: "#00338D" },
  "Carolina Panthers": { abbr: "CAR", color: "#0085CA" },
  "Chicago Bears": { abbr: "CHI", color: "#0B162A" },
  "Cincinnati Bengals": { abbr: "CIN", color: "#FB4F14" },
  "Cleveland Browns": { abbr: "CLE", color: "#472A08" },
  "Dallas Cowboys": { abbr: "DAL", color: "#041E42" },
  "Denver Broncos": { abbr: "DEN", color: "#FB4F14" },
  "Detroit Lions": { abbr: "DET", color: "#0076B6" },
  "Green Bay Packers": { abbr: "GB", color: "#203731" },
  "Houston Texans": { abbr: "HOU", color: "#03202F" },
  "Indianapolis Colts": { abbr: "IND", color: "#002C5F" },
  "Jacksonville Jaguars": { abbr: "JAX", color: "#006778" },
  "Kansas City Chiefs": { abbr: "KC", color: "#E31837" },
  "LA Chargers": { abbr: "LAC", color: "#0080C6" },
  "LA Rams": { abbr: "LAR", color: "#003594" },
  "Las Vegas Raiders": { abbr: "LV", color: "#A5ACAF" },
  "Miami Dolphins": { abbr: "MIA", color: "#008E97" },
  "Minnesota Vikings": { abbr: "MIN", color: "#4F2683" },
  "New England Patriots": { abbr: "NE", color: "#002244" },
  "New Orleans Saints": { abbr: "NO", color: "#D3BC8D" },
  "New York Giants": { abbr: "NYG", color: "#0B2265" },
  "New York Jets": { abbr: "NYJ", color: "#125740" },
  "Philadelphia Eagles": { abbr: "PHI", color: "#004C54" },
  "Pittsburgh Steelers": { abbr: "PIT", color: "#FFB612" },
  "Seattle Seahawks": { abbr: "SEA", color: "#69BE28" },
  "San Francisco 49ers": { abbr: "SF", color: "#AA0000" },
  "Tampa Bay Buccaneers": { abbr: "TB", color: "#D50A0A" },
  "Tennessee Titans": { abbr: "TEN", color: "#4B92DB" },
  "Washington Commanders": { abbr: "WAS", color: "#5A1414" },
};

const FALLBACK: NflTeamStyle = { abbr: "—", color: "#3a3a3a" };

export function teamStyle(name: string): NflTeamStyle {
  return NFL_TEAM_STYLES[name] ?? FALLBACK;
}

// Sleeper's player data (apps/server/src/lib/sleeper.ts) gives us each
// player's team as a bare abbreviation, not the full name teamStyle keys
// on — build a reverse lookup once, with a couple of aliases for
// abbreviations some sources use differently (e.g. "WSH" vs "WAS").
const ABBR_ALIASES: Record<string, string> = { JAC: "JAX", WSH: "WAS" };
const STYLE_BY_ABBR: Record<string, NflTeamStyle> = {};
for (const style of Object.values(NFL_TEAM_STYLES)) STYLE_BY_ABBR[style.abbr] = style;

export function teamStyleByAbbr(abbr: string | undefined): NflTeamStyle | null {
  if (!abbr) return null;
  return STYLE_BY_ABBR[ABBR_ALIASES[abbr] ?? abbr] ?? null;
}

/** Black or white, whichever reads better on a given team color (e.g. Steelers gold needs black, Ravens purple needs white). */
export function contrastText(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#ffffff";
}
