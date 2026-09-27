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

function PropRow({ prop }: { prop: PropLine }) {
  const overPct = prop.overProbability === null ? "—" : `${Math.round(prop.overProbability * 100)}%`;
  return (
    <View style={styles.propRow}>
      <Text style={styles.propLabel} numberOfLines={2}>
        {prop.label}
      </Text>
      <Text style={styles.propOver}>{overPct}</Text>
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

          <Text style={[styles.groupHeading, { marginTop: 16 }]}>Receiving Yards</Text>
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
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
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
        <View style={styles.sourcesRow}>
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
    paddingBottom: 16,
  },
  matchup: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    fontFamily: fontMedium,
  },
  at: {
    color: colors.textMuted,
    fontWeight: "400",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: font,
    marginTop: 2,
  },
  demoRow: {
    marginTop: 8,
  },
  demoBadge: {
    alignSelf: "flex-start",
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sourcesRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  sourcesGap: {
    width: 16,
  },
  sourceColumn: {
    flex: 1,
  },
  sourceLabel: {
    fontSize: 14,
    fontWeight: "800",
    fontFamily: fontMedium,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  groupHeading: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  propRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    gap: 8,
  },
  propLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: font,
  },
  propOver: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    fontFamily: fontMedium,
    fontVariant: ["tabular-nums"],
  },
});
