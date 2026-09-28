import { NextResponse } from "next/server";
import { fetchPolymarketGameProps } from "@/lib/polymarket";
import { teamByAbbr } from "@/lib/nflTeams";
import { generateDemoProps } from "@/lib/demo";
import { findSleeperPlayer } from "@/lib/sleeper";
import type { GameProps, GamePropsResponse, PropCategory } from "@/lib/types";

/** Attaches a real headshot + team (via Sleeper) to each line whose player name matches, best-effort. */
async function enrichWithSleeper(props: GameProps): Promise<GameProps> {
  const enriched = { ...props };
  for (const category of Object.keys(props) as PropCategory[]) {
    enriched[category] = await Promise.all(
      props[category].map(async (line) => {
        const match = await findSleeperPlayer(line.playerName);
        if (!match) return line;
        return { ...line, headshotUrl: match.headshotUrl, team: match.team ?? undefined };
      })
    );
  }
  return enriched;
}

// Player props (QB passing yards, top receivers' receiving yards) for one
// game, by source. `gameId` is the id buildGameOdds assigns:
// "<sport>:<ABBR>-<ABBR>" (alphabetical), e.g. "nfl:BUF-KC".
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport") ?? "nfl";
  const gameId = searchParams.get("gameId") ?? "";

  const [, pair] = gameId.split(":");
  const [abbrA, abbrB] = (pair ?? "").split("-");
  const teamA = abbrA ? teamByAbbr(abbrA) : null;
  const teamB = abbrB ? teamByAbbr(abbrB) : null;

  if (sport !== "nfl" || !teamA || !teamB) {
    return NextResponse.json({ error: "Unknown or unsupported gameId" }, { status: 400 });
  }

  let polymarket: GamePropsResponse["polymarket"] = null;
  let demo = false;
  let reason: string | undefined;

  try {
    const props = await fetchPolymarketGameProps(sport, teamA, teamB);
    const hasAny = Object.values(props).some((lines) => lines.length > 0);
    if (!hasAny) {
      polymarket = generateDemoProps();
      demo = true;
      reason = "polymarket: no live prop markets found for this game";
    } else {
      polymarket = await enrichWithSleeper(props);
    }
  } catch (err) {
    polymarket = generateDemoProps();
    demo = true;
    reason = `polymarket: ${err instanceof Error ? err.message : "request failed"}`;
  }

  // Kalshi's player-prop series ticker naming isn't confirmed yet (unlike
  // KXNFLGAME for moneylines), so we don't guess at it here — surfacing
  // null is more honest than a silently-wrong live attempt.
  const kalshi: GamePropsResponse["kalshi"] = null;

  const body: GamePropsResponse = {
    gameId,
    sport,
    teamA: teamA.name,
    teamB: teamB.name,
    polymarket,
    kalshi,
    demo,
    reason,
    updatedAt: Date.now(),
  };

  return NextResponse.json(body);
}
