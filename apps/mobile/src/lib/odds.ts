// Converts an implied probability (0-1, what every source actually gives us)
// into American odds notation (-125, +140, etc.) for display. Standard
// sportsbook formula: favorites (p >= 0.5) get negative odds sized to how
// much you'd need to stake to win 100; underdogs (p < 0.5) get positive
// odds sized to what a 100 stake would win.
export function toAmericanOdds(p: number | null): string {
  if (p === null || p <= 0 || p >= 1) return "—";
  if (p >= 0.5) return `-${Math.round((p / (1 - p)) * 100)}`;
  return `+${Math.round(((1 - p) / p) * 100)}`;
}
