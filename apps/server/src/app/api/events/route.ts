import { NextResponse } from "next/server";
import { fetchSourceEvents, ALL_SOURCES } from "@/lib/fetchSource";
import type { EventsResponse, Source } from "@/lib/types";

// William Hill (via The Odds API) only has soccer wired up so far — keep it out
// of every other sport's feed rather than showing an always-demo "William Hill"
// entry there.
const SOURCES_BY_SPORT: Partial<Record<string, Source[]>> = {
  soccer: ALL_SOURCES,
};
const DEFAULT_SOURCES: Source[] = ["polymarket", "kalshi"];

// The unified feed the mobile app actually uses: every source for this
// sport, merged and sorted by volume. Each event still carries its own
// `source`, so the UI can group/label them — this endpoint just saves the
// app N round trips.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");
  const sources = SOURCES_BY_SPORT[sport ?? ""] ?? DEFAULT_SOURCES;

  const results = await Promise.all(sources.map((source) => fetchSourceEvents(source, sport)));

  const events = results.flatMap((r) => r.events).sort((a, b) => b.volume - a.volume);
  const reasons = results
    .map((r, i) => ({ source: sources[i], ...r }))
    .filter((r) => r.demo && r.reason)
    .map((r) => `${r.source}: ${r.reason}`);

  const merged: EventsResponse = {
    events,
    demo: results.some((r) => r.demo),
    reason: reasons.length ? reasons.join("; ") : undefined,
    updatedAt: Date.now(),
  };

  return NextResponse.json(merged);
}
