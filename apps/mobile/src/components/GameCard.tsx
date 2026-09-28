import { Pressable, StyleSheet, Text, View } from "react-native";
import type { GameOdds, GameSourceOdds } from "@/types";
import { colors, font, fontMedium } from "@/theme";
import { contrastText, teamStyle } from "@/lib/nflTeamStyles";

function formatKickoff(iso: string | null): string {
  if (!iso) return "TIME TBD";
  try {
    return (
      new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
      }).format(new Date(iso)) + " ET"
    );
  } catch {
    return "TIME TBD";
  }
}

function pct(v: number | null): string {
  return v === null ? "—" : `${Math.round(v * 100)}%`;
}

// Each platform's own brand color, used for its column heading.
const SOURCE_BRAND_COLOR = {
  polymarket: "#1652F0",
  kalshi: "#00916e", // darkened from Kalshi's brand green for legibility as text on a light background
};

function TeamBadge({ name, align }: { name: string; align: "left" | "right" }) {
  const style = teamStyle(name);
  return (
    <View style={[styles.badgeColumn, align === "right" && { alignItems: "flex-end" }]}>
      <View style={[styles.badge, { backgroundColor: style.color }]}>
        <Text style={[styles.badgeText, { color: contrastText(style.color) }]}>{style.abbr}</Text>
      </View>
      <Text style={[styles.badgeName, align === "right" && { textAlign: "right" }]} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

function SourceColumn({
  label,
  brandColor,
  odds,
  teamA,
  teamB,
}: {
  label: string;
  brandColor: string;
  odds: GameSourceOdds | null;
  teamA: string;
  teamB: string;
}) {
  const teamAStyle = teamStyle(teamA);
  const teamBStyle = teamStyle(teamB);
  return (
    <View style={styles.sourceColumn}>
      <Text style={[styles.sourceLabel, { color: brandColor }]}>{label}</Text>
      <View style={styles.sourceRow}>
        <View style={[styles.sourceDot, { backgroundColor: teamAStyle.color }]} />
        <Text style={styles.sourceAbbr}>{teamAStyle.abbr}</Text>
        <Text style={[styles.sourceProb, !odds && styles.sourceProbMissing]}>
          {pct(odds?.teamAProbability ?? null)}
        </Text>
      </View>
      <View style={styles.sourceRow}>
        <View style={[styles.sourceDot, { backgroundColor: teamBStyle.color }]} />
        <Text style={styles.sourceAbbr}>{teamBStyle.abbr}</Text>
        <Text style={[styles.sourceProb, !odds && styles.sourceProbMissing]}>
          {pct(odds?.teamBProbability ?? null)}
        </Text>
      </View>
    </View>
  );
}

export function GameCard({ game, onPress }: { game: GameOdds; onPress?: () => void }) {
  const teamAColor = teamStyle(game.teamA).color;
  const teamBColor = teamStyle(game.teamB).color;

  return (
    <Pressable style={styles.shadowWrap} onPress={onPress}>
      <View style={styles.cardWrap}>
        <View style={styles.splitBorder}>
          <View style={[styles.splitHalf, { backgroundColor: teamAColor }]} />
          <View style={[styles.splitHalf, { backgroundColor: teamBColor }]} />
        </View>

        <View style={styles.card}>
          <View style={styles.matchupRow}>
            <TeamBadge name={game.teamA} align="left" />
            <Text style={styles.kickoff}>{formatKickoff(game.kickoff)}</Text>
            <TeamBadge name={game.teamB} align="right" />
          </View>

          <View style={styles.divider} />

          <View style={styles.sourcesRow}>
            <SourceColumn
              label="POLYMARKET"
              brandColor={SOURCE_BRAND_COLOR.polymarket}
              odds={game.polymarket}
              teamA={game.teamA}
              teamB={game.teamB}
            />
            <View style={styles.sourcesGap} />
            <SourceColumn
              label="KALSHI"
              brandColor={SOURCE_BRAND_COLOR.kalshi}
              odds={game.kalshi}
              teamA={game.teamA}
              teamB={game.teamB}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const BORDER_HEIGHT = 5;
const CARD_RADIUS = 18;

const styles = StyleSheet.create({
  // Separate from cardWrap because overflow:hidden (needed to clip the
  // split-color bar to the rounded corners) also clips iOS shadows —
  // this outer view carries the shadow, the inner one the clipping.
  shadowWrap: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: CARD_RADIUS,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  cardWrap: {
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  splitBorder: {
    flexDirection: "row",
    height: BORDER_HEIGHT,
  },
  splitHalf: {
    flex: 1,
  },
  card: {
    // Translucent instead of a solid fill, so the gray page background
    // shows through slightly — a "glass" card instead of a flat block.
    backgroundColor: "rgba(255,255,255,0.4)",
    padding: 16,
  },
  matchupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeColumn: {
    flex: 1,
    alignItems: "flex-start",
    gap: 6,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.3,
  },
  badgeName: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: font,
    maxWidth: 100,
  },
  kickoff: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.2,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  sourcesRow: {
    flexDirection: "row",
  },
  sourcesGap: {
    width: 16,
  },
  sourceColumn: {
    flex: 1,
    gap: 8,
  },
  sourceLabel: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sourceDot: {
    width: 8,
    height: 8,
    borderRadius: 1,
  },
  sourceAbbr: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: font,
    letterSpacing: 0.3,
  },
  sourceProb: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: fontMedium,
    fontVariant: ["tabular-nums"],
  },
  sourceProbMissing: {
    color: colors.textMuted,
    fontWeight: "400",
  },
});
