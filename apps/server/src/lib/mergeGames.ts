import type { GameOdds, GameSourceOdds, OddsEvent } from "./types";
import { findTeam, matchGameTeams, type NflTeam } from "./nflTeams";

// buildGameOdds only ever merges the two sources GameOdds actually has
// fields for — William Hill (soccer only, via The Odds API) doesn't have
// per-game moneyline matching wired up, only NFL does.
type GameMatchedSource = "polymarket" | "kalshi";

function gameKey(a: NflTeam, b: NflTeam): string {
  return [a.abbr, b.abbr].sort().join("-");
}

function sourceOdds(event: OddsEvent, teamA: NflTeam, teamB: NflTeam): GameSourceOdds {
  let teamAProbability: number | null = null;
  let teamBProbability: number | null = null;

  for (const o of event.outcomes) {
    const t = findTeam(o.name);
    if (t?.abbr === teamA.abbr) teamAProbability = o.impliedProbability;
    else if (t?.abbr === teamB.abbr) teamBProbability = o.impliedProbability;
  }

  // Outcome labels didn't name the teams directly (e.g. plain "Yes"/"No") —
  // fall back to positional order, matching how matchGameTeams derived
  // teamA/teamB from the title in the first place.
  if (teamAProbability === null && teamBProbability === null && event.outcomes.length === 2) {
    teamAProbability = event.outcomes[0].impliedProbability;
    teamBProbability = event.outcomes[1].impliedProbability;
  }

  return { teamAProbability, teamBProbability, sourceUrl: event.sourceUrl };
}

/**
 * Merges each source's per-game moneyline events into one row per
 * real-world game, keyed by the two teams involved. A game appears once
 * even if only one source covers it (the other source's field is null).
 */
export function buildGameOdds(eventsBySource: Partial<Record<GameMatchedSource, OddsEvent[]>>): GameOdds[] {
  const games = new Map<string, GameOdds>();

  for (const [source, events] of Object.entries(eventsBySource) as [GameMatchedSource, OddsEvent[] | undefined][]) {
    if (!events) continue;
    for (const event of events) {
      const teams = matchGameTeams(event);
      if (!teams) continue; // not a two-team moneyline market — likely a future/prop, skip

      const [teamA, teamB] = [...teams].sort((x, y) => x.abbr.localeCompare(y.abbr));
      const key = gameKey(teamA, teamB);

      const game =
        games.get(key) ??
        ({
          id: `${event.sport}:${key}`,
          sport: event.sport,
          teamA: teamA.name,
          teamB: teamB.name,
          kickoff: null,
          polymarket: null,
          kalshi: null,
        } satisfies GameOdds);
      games.set(key, game);

      if (!game.kickoff && event.closeTime) game.kickoff = event.closeTime;
      game[source] = sourceOdds(event, teamA, teamB);
    }
  }

  return Array.from(games.values()).sort((a, b) => {
    if (!a.kickoff && !b.kickoff) return 0;
    if (!a.kickoff) return 1;
    if (!b.kickoff) return -1;
    return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
  });
}
