// Sleeper (the fantasy football app) publishes a free, keyless, public
// database of every NFL player, explicitly meant for third-party apps to
// use — see https://docs.sleeper.com/#players. It gives us two things our
// own prop extraction can't: a real headshot image, and the player's
// current team (which finally makes team-split props possible later,
// since Polymarket/Kalshi's market text alone never tells us that).
const SLEEPER_PLAYERS_URL = "https://api.sleeper.app/v1/players/nfl";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // roster data changes slowly; avoid refetching this ~5MB payload often

interface SleeperPlayer {
  full_name?: string;
  team?: string | null;
}

interface IndexedPlayer {
  id: string;
  team: string | null;
}

let cache: { index: Map<string, IndexedPlayer>; fetchedAt: number } | null = null;
let inFlight: Promise<Map<string, IndexedPlayer>> | null = null;

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.']/g, "")
    .replace(/\b(jr|sr|ii|iii|iv|v)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadIndex(): Promise<Map<string, IndexedPlayer>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.index;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const res = await fetch(SLEEPER_PLAYERS_URL, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`Sleeper ${res.status}`);
    const data = (await res.json()) as Record<string, SleeperPlayer>;

    const index = new Map<string, IndexedPlayer>();
    for (const [id, p] of Object.entries(data)) {
      if (!p.full_name) continue;
      index.set(normalizeName(p.full_name), { id, team: p.team ?? null });
    }
    cache = { index, fetchedAt: Date.now() };
    inFlight = null;
    return index;
  })();

  return inFlight;
}

export interface SleeperMatch {
  headshotUrl: string;
  team: string | null;
}

/** Looks up a player by name against Sleeper's roster. Degrades to null (no photo) rather than throwing if Sleeper is unreachable. */
export async function findSleeperPlayer(playerName: string): Promise<SleeperMatch | null> {
  try {
    const index = await loadIndex();
    const hit = index.get(normalizeName(playerName));
    if (!hit) return null;
    return {
      headshotUrl: `https://sleepercdn.com/content/nfl/players/thumb/${hit.id}.jpg`,
      team: hit.team,
    };
  } catch {
    return null;
  }
}
