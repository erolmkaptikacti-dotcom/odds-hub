import type { EventsResponse, OddsEvent, Source } from "./types";
import { fetchPolymarketEvents } from "./polymarket";
import { fetchKalshiEvents } from "./kalshi";
import { fetchWilliamHillEvents } from "./oddsApi";
import { generateDemoEvents } from "./demo";
import { isSupportedSport } from "./sports";

export const ALL_SOURCES: Source[] = ["polymarket", "kalshi", "williamhill"];

const FETCHERS: Record<Source, (sport: string, league: string | null) => Promise<OddsEvent[]>> = {
  polymarket: (sport) => fetchPolymarketEvents(sport),
  kalshi: (sport) => fetchKalshiEvents(sport),
  williamhill: (sport, league) => fetchWilliamHillEvents(sport, league),
};

/** Fetches live events for one source, falling back to tagged demo data on any failure. `league` only matters to sources that have multiple (currently just William Hill/soccer). */
export async function fetchSourceEvents(
  source: Source,
  sportParam: string | null,
  league: string | null = null
): Promise<EventsResponse> {
  const sport = sportParam && isSupportedSport(sportParam) ? sportParam : "nfl";

  try {
    const events = await FETCHERS[source](sport, league);
    if (events.length > 0) {
      return { events, demo: false, updatedAt: Date.now() };
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
