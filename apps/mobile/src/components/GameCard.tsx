import { StyleSheet, Text, View } from "react-native";
import type { GameOdds, GameSourceOdds } from "@/types";
import { colors, font, fontMedium } from "@/theme";

function formatKickoff(iso: string | null): string {
  if (!iso) return "Time TBD";
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
    }).format(new Date(iso)) + " ET";
  } catch {
    return "Time TBD";
  }
}

function pct(v: number | null): string {
  return v === null ? "—" : `${Math.round(v * 100)}%`;
}

function SourceRow({ label, odds }: { label: string; odds: GameSourceOdds | null }) {
  return (
    <View style={styles.sourceRow}>
      <Text style={styles.sourceLabel}>{label}</Text>
      <Text style={[styles.sourceProb, !odds && styles.sourceProbMissing]}>
        {pct(odds?.teamAProbability ?? null)}
      </Text>
      <Text style={[styles.sourceProb, !odds && styles.sourceProbMissing]}>
        {pct(odds?.teamBProbability ?? null)}
      </Text>
    </View>
  );
}

export function GameCard({ game }: { game: GameOdds }) {
  return (
    <View style={styles.card}>
      <Text style={styles.kickoff}>{formatKickoff(game.kickoff)}</Text>
      <Text style={styles.matchup}>
        {game.teamA} <Text style={styles.at}>@</Text> {game.teamB}
      </Text>

      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderCell} />
          <Text style={styles.tableHeaderCell} numberOfLines={1}>
            {game.teamA.split(" ").pop()}
          </Text>
          <Text style={styles.tableHeaderCell} numberOfLines={1}>
            {game.teamB.split(" ").pop()}
          </Text>
        </View>
        <SourceRow label="Polymarket" odds={game.polymarket} />
        <SourceRow label="Kalshi" odds={game.kalshi} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 2,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kickoff: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fontMedium,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  matchup: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: fontMedium,
    marginBottom: 14,
  },
  at: {
    color: colors.textMuted,
    fontWeight: "400",
  },
  table: {
    gap: 8,
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeaderCell: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fontMedium,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    textAlign: "right",
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  sourceLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: font,
  },
  sourceProb: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: fontMedium,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  sourceProbMissing: {
    color: colors.textMuted,
    fontWeight: "400",
  },
});
