import type { EventsResponse, OddsEvent, Source } from "./types";
import { fetchPolymarketEvents } from "./polymarket";
import { fetchKalshiEvents } from "./kalshi";
import { fetchWilliamHillEvents } from "./oddsApi";
import { generateDemoEvents } from "./demo";
import { isSupportedSport } from "./sports";

export const ALL_SOURCES: Source[] = ["polymarket", "kalshi", "williamhill"];

const FETCHERS: Record<Source, (sport: string, league: string | null) => Promise<OddsEvent[]>> = {
  polymarket: (sport, league) => fetchPolymarketEvents(sport, league),
  kalshi: (sport) => fetchKalshiEvents(sport),
  williamhill: (sport, league) => fetchWilliamHillEvents(sport, league),
};

/** Fetches live events for one source, falling back to tagged demo data on any failure. `league` only matters to sources that vary by it (William Hill always; Polymarket only where a confirmed slug filter exists, see soccerLeagues.ts). */
export async function fetchSourceEvents(
  source: Source,
  sportParam: string | null,
  league: string | null = null
): Promise<EventsResponse> {
  const sport = sportParam && isSupportedSport(sportParam) ? sportParam : "nfl";

  // Polymarket's soccer coverage genuinely doesn't include every league
  // (e.g. it may have Nations League/MLS games but nothing from a given
  // domestic league this week) — that's not a fetch failure, it's an
  // accurate "nothing here" for that league. Falling back to the generic
  // single-matchup demo data in that case doesn't even match the
  // selected league (it's always the same hardcoded pair), so it reads
  // as real-but-wrong data instead of an honest empty result. Only
  // Polymarket + soccer + a specific league selected skips the fallback;
  // every other source/sport combo keeps demo data so the app never
  // looks broken when a real fetch fails.
  const skipDemoFallback = source === "polymarket" && sport === "soccer" && !!league;

  try {
    const events = await FETCHERS[source](sport, league);
    if (events.length > 0) {
      return { events, demo: false, updatedAt: Date.now() };
    }
    if (skipDemoFallback) {
      return { events: [], demo: false, updatedAt: Date.now() };
    }
    return {
      events: generateDemoEvents(source, sport),
      demo: true,
      reason: "Live source returned no events",
      updatedAt: Date.now(),
    };
  } catch (err) {
    return {
      events: generateDemoEvents(source, sport),
      demo: true,
      reason: err instanceof Error ? err.message : "Request failed",
      updatedAt: Date.now(),
    };
  }
}
