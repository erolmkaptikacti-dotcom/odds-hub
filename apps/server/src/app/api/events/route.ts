import { NextResponse } from "next/server";
import { fetchSourceEvents } from "@/lib/fetchSource";
import type { EventsResponse } from "@/lib/types";

// The unified feed the mobile app actually uses: both sources, merged and
// sorted by volume. Each event still carries its own `source`, so the UI
// can group/label Polymarket vs Kalshi — this endpoint just saves the app
// two round trips.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");

  const [poly, kalshi] = await Promise.all([
    fetchSourceEvents("polymarket", sport),
    fetchSourceEvents("kalshi", sport),
  ]);

  const events = [...poly.events, ...kalshi.events].sort((a, b) => b.volume - a.volume);
  const reasons = [poly, kalshi]
    .filter((r) => r.demo && r.reason)
    .map((r, i) => `${i === 0 ? "polymarket" : "kalshi"}: ${r.reason}`);

  const merged: EventsResponse = {
    events,
    demo: poly.demo || kalshi.demo,
    reason: reasons.length ? reasons.join("; ") : undefined,
    updatedAt: Date.now(),
  };

  return NextResponse.json(merged);
}
