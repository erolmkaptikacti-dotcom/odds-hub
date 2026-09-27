// Fallback data shown (clearly tagged) when a live source is unreachable,
// so the app is always exercisable end-to-end even if an upstream API is
// down or its shape has drifted.
import type { OddsEvent, Source } from "./types";

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
      sourceUrl: source === "polymarket" ? "https://polymarket.com" : "https://kalshi.com",
    };
  });
}
