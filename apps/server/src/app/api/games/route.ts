import { NextResponse } from "next/server";
import { fetchSourceEvents } from "@/lib/fetchSource";
import { buildGameOdds } from "@/lib/mergeGames";
import type { GamesResponse } from "@/lib/types";

// The per-game moneyline feed: each real-world game once, with Polymarket
// and Kalshi's implied probabilities lined up side by side, sorted by
// kickoff time. Season-long futures are filtered out by buildGameOdds
// (only markets naming exactly two teams qualify).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");

  const [poly, kalshi] = await Promise.all([
    fetchSourceEvents("polymarket", sport),
    fetchSourceEvents("kalshi", sport),
  ]);

  const games = buildGameOdds({ polymarket: poly.events, kalshi: kalshi.events });
  const reasons = [poly, kalshi]
    .filter((r) => r.demo && r.reason)
    .map((r, i) => `${i === 0 ? "polymarket" : "kalshi"}: ${r.reason}`);

  const body: GamesResponse = {
    games,
    demo: poly.demo || kalshi.demo,
    reason: reasons.length ? reasons.join("; ") : undefined,
    updatedAt: Date.now(),
  };

  return NextResponse.json(body);
}
