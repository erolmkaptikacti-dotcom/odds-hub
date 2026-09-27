export const SUPPORTED_SPORTS = ["nfl", "nba", "mlb", "nhl", "soccer"] as const;
export type Sport = (typeof SUPPORTED_SPORTS)[number];

export function isSupportedSport(v: string): v is Sport {
  return (SUPPORTED_SPORTS as readonly string[]).includes(v);
}
