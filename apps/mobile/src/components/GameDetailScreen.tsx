import { ScrollView, StyleSheet, Text, View } from "react-native";
import { API_BASE_URL } from "@/config";
import { usePolledFetch } from "@/hooks/usePolledFetch";
import { colors, font, fontMedium } from "@/theme";
import { sharedStyles } from "@/sharedStyles";
import type { GameOdds, GameProps, GamePropsResponse, PropLine } from "@/types";

const SOURCE_BRAND_COLOR = {
  polymarket: "#1652F0",
  kalshi: "#00D298",
};

// The market question already names the player before "Over/Under N
// yards?" — strip that part off so we can show the player's name as its
// own line and the number as its own big stat, instead of one long
// sentence.
function playerName(label: string): string {
  const idx = label.search(/\b(over|under)\b/i);
  const name = (idx === -1 ? label : label.slice(0, idx)).replace(/^will\s+/i, "").trim();
  return name || label;
}

function PropRow({ prop }: { prop: PropLine }) {
  const over = prop.overProbability;
  const under = over === null ? null : 1 - over;
  return (
    <View style={styles.propRow}>
      <Text style={styles.propPlayer} numberOfLines={2}>
        {playerName(prop.label)}
      </Text>
      <View style={styles.propStatRow}>
        <Text style={styles.propLine}>{prop.line !== null ? `${prop.line} yds` : "Line TBD"}</Text>
        <View style={styles.propBoxes}>
          <View style={[styles.propBox, styles.propBoxYes]}>
            <Text style={styles.propBoxLabel}>YES</Text>
            <Text style={styles.propBoxValue}>{over === null ? "—" : `${Math.round(over * 100)}%`}</Text>
          </View>
          <View style={[styles.propBox, styles.propBoxNo]}>
            <Text style={styles.propBoxLabel}>NO</Text>
            <Text style={styles.propBoxValue}>{under === null ? "—" : `${Math.round(under * 100)}%`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function SourcePropsColumn({
  label,
  brandColor,
  props,
}: {
  label: string;
  brandColor: string;
  props: GameProps | null;
}) {
  return (
    <View style={styles.sourceColumn}>
      <Text style={[styles.sourceLabel, { color: brandColor }]}>{label}</Text>

      {!props && <Text style={sharedStyles.muted}>Not available yet</Text>}

      {props && (
        <>
          <Text style={styles.groupHeading}>QB Passing Yards</Text>
          {props.passing.length === 0 && <Text style={sharedStyles.muted}>No lines found</Text>}
          {props.passing.map((p, i) => (
            <PropRow key={`p${i}`} prop={p} />
          ))}

          <Text style={[styles.groupHeading, { marginTop: 24 }]}>Receiving Yards</Text>
          {props.receiving.length === 0 && <Text style={sharedStyles.muted}>No lines found</Text>}
          {props.receiving.map((p, i) => (
            <PropRow key={`r${i}`} prop={p} />
          ))}
        </>
      )}
    </View>
  );
}

export function GameDetailScreen({ game }: { game: GameOdds }) {
  const { data, error, loading } = usePolledFetch<GamePropsResponse>(
    `${API_BASE_URL}/api/props?sport=${game.sport}&gameId=${game.id}`,
    30_000
  );

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.matchup}>
          {game.teamA} <Text style={styles.at}>@</Text> {game.teamB}
        </Text>
        <Text style={styles.subtitle}>Player Props</Text>
        {data?.demo && (
          <View style={styles.demoRow}>
            <Text style={styles.demoBadge}>DEMO DATA</Text>
          </View>
        )}
      </View>

      {loading && !data && (
        <View style={sharedStyles.centerBox}>
          <Text style={sharedStyles.muted}>Loading props…</Text>
        </View>
      )}

      {error && (
        <View style={sharedStyles.centerBox}>
          <Text style={sharedStyles.errorText}>Couldn&apos;t reach the server: {error}</Text>
        </View>
      )}

      {data && (
        <View style={styles.sourcesColumnStack}>
          <SourcePropsColumn label="POLYMARKET" brandColor={SOURCE_BRAND_COLOR.polymarket} props={data.polymarket} />
          <View style={styles.sourcesGap} />
          <SourcePropsColumn label="KALSHI" brandColor={SOURCE_BRAND_COLOR.kalshi} props={data.kalshi} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  matchup: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    fontFamily: fontMedium,
  },
  at: {
    color: colors.textMuted,
    fontWeight: "400",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: font,
    marginTop: 2,
  },
  demoRow: {
    marginTop: 10,
  },
  demoBadge: {
    alignSelf: "flex-start",
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  // Stacked, not side-by-side: at the bigger text sizes this needs the
  // full screen width per source to stay readable, hence "fine to scroll".
  sourcesColumnStack: {
    paddingHorizontal: 16,
  },
  sourcesGap: {
    height: 32,
  },
  sourceColumn: {
    flex: 1,
  },
  sourceLabel: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: fontMedium,
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  groupHeading: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  propRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 14,
    gap: 8,
  },
  propPlayer: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: fontMedium,
  },
  propStatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  propLine: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: fontMedium,
    fontVariant: ["tabular-nums"],
  },
  propBoxes: {
    flexDirection: "row",
    gap: 8,
  },
  propBox: {
    minWidth: 56,
    alignItems: "center",
    borderRadius: 2,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  propBoxYes: {
    backgroundColor: "rgba(47,191,113,0.16)",
    borderWidth: 1,
    borderColor: "#2fbf71",
  },
  propBoxNo: {
    backgroundColor: "rgba(229,84,75,0.16)",
    borderWidth: 1,
    borderColor: "#e5544b",
  },
  propBoxLabel: {
    fontSize: 10,
    fontWeight: "800",
    fontFamily: fontMedium,
    letterSpacing: 0.6,
    color: colors.textMuted,
  },
  propBoxValue: {
    fontSize: 15,
    fontWeight: "800",
    fontFamily: fontMedium,
    color: colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
});
