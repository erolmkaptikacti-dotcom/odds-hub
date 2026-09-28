// Fallback data shown (clearly tagged) when a live source is unreachable,
// so the app is always exercisable end-to-end even if an upstream API is
// down or its shape has drifted.
import type { GameProps, OddsEvent, Source } from "./types";

const DEMO_MATCHUPS: Record<string, [string, string][]> = {
  nfl: [
    ["Kansas City Chiefs", "Buffalo Bills"],
    ["San Francisco 49ers", "Dallas Cowboys"],
  ],
  nba: [
    ["Boston Celtics", "Denver Nuggets"],
    ["LA Lakers", "Golden State Warriors"],
  ],
  mlb: [["NY Yankees", "LA Dodgers"]],
  nhl: [["Edmonton Oilers", "Florida Panthers"]],
  soccer: [["Manchester City", "Real Madrid"]],
};

const DEMO_SOURCE_URL: Record<Source, string> = {
  polymarket: "https://polymarket.com",
  kalshi: "https://kalshi.com",
  williamhill: "https://www.williamhill.com",
};

export function generateDemoEvents(source: Source, sport: string): OddsEvent[] {
  const matchups = DEMO_MATCHUPS[sport] ?? [];
  return matchups.map(([home, away], i) => {
    const homeProb = 0.4 + ((i * 7) % 20) / 100; // deterministic-ish spread
    return {
      id: `${source}:demo-${sport}-${i}`,
      source,
      sport,
      title: `${home} vs ${away}`,
      outcomes: [
        { name: `${home} win`, impliedProbability: homeProb },
        { name: `${away} win`, impliedProbability: 1 - homeProb },
      ],
      volume: 12000 + i * 4300,
      closeTime: null,
      sourceUrl: DEMO_SOURCE_URL[source],
    };
  });
}

// Generic placeholder labels rather than guessed real player names — a
// wrong real name shown under a "DEMO DATA" badge is still misinformation,
// a made-up role name isn't.
export function generateDemoProps(): GameProps {
  return {
    anytimeTd: [
      { label: "Home WR1 Anytime Touchdown", playerName: "Home WR1", line: null, overProbability: 0.42, sourceUrl: "" },
      { label: "Home RB1 Anytime Touchdown", playerName: "Home RB1", line: null, overProbability: 0.38, sourceUrl: "" },
      { label: "Away WR1 Anytime Touchdown", playerName: "Away WR1", line: null, overProbability: 0.4, sourceUrl: "" },
      { label: "Away RB1 Anytime Touchdown", playerName: "Away RB1", line: null, overProbability: 0.35, sourceUrl: "" },
    ],
    passing: [
      { label: "Home Starting QB — Over 245.5 Passing Yards", playerName: "Home Starting QB", line: 245.5, overProbability: 0.52, sourceUrl: "" },
      { label: "Away Starting QB — Over 231.5 Passing Yards", playerName: "Away Starting QB", line: 231.5, overProbability: 0.48, sourceUrl: "" },
    ],
    rushing: [
      { label: "Home RB1 — Over 62.5 Rushing Yards", playerName: "Home RB1", line: 62.5, overProbability: 0.51, sourceUrl: "" },
      { label: "Away RB1 — Over 58.5 Rushing Yards", playerName: "Away RB1", line: 58.5, overProbability: 0.49, sourceUrl: "" },
    ],
    receiving: [
      { label: "Home WR1 — Over 68.5 Receiving Yards", playerName: "Home WR1", line: 68.5, overProbability: 0.55, sourceUrl: "" },
      { label: "Home WR2 — Over 47.5 Receiving Yards", playerName: "Home WR2", line: 47.5, overProbability: 0.5, sourceUrl: "" },
      { label: "Home WR3 — Over 39.5 Receiving Yards", playerName: "Home WR3", line: 39.5, overProbability: 0.46, sourceUrl: "" },
      { label: "Away WR1 — Over 64.5 Receiving Yards", playerName: "Away WR1", line: 64.5, overProbability: 0.53, sourceUrl: "" },
      { label: "Away WR2 — Over 44.5 Receiving Yards", playerName: "Away WR2", line: 44.5, overProbability: 0.49, sourceUrl: "" },
      { label: "Away WR3 — Over 35.5 Receiving Yards", playerName: "Away WR3", line: 35.5, overProbability: 0.45, sourceUrl: "" },
    ],
  };
}
