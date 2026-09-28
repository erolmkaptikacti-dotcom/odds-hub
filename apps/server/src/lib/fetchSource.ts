import type { EventsResponse, OddsEvent, Source } from "./types";
import { fetchPolymarketEvents } from "./polymarket";
import { fetchKalshiEvents } from "./kalshi";
import { fetchWilliamHillEvents } from "./oddsApi";
import { generateDemoEvents } from "./demo";
import { isSupportedSport } from "./sports";

export const ALL_SOURCES: Source[] = ["polymarket", "kalshi", "williamhill"];

const FETCHERS: Record<Source, (sport: string) => Promise<OddsEvent[]>> = {
  polymarket: fetchPolymarketEvents,
  kalshi: fetchKalshiEvents,
  williamhill: fetchWilliamHillEvents,
};

/** Fetches live events for one source, falling back to tagged demo data on any failure. */
export async function fetchSourceEvents(source: Source, sportParam: string | null): Promise<EventsResponse> {
  const sport = sportParam && isSupportedSport(sportParam) ? sportParam : "nfl";

  try {
    const events = await FETCHERS[source](sport);
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
