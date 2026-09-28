import { StyleSheet, Text, View } from "react-native";
import type { OddsEvent } from "@/types";
import { colors, font, fontMedium } from "@/theme";

const SOURCE_LABEL: Record<OddsEvent["source"], string> = {
  polymarket: "Polymarket",
  kalshi: "Kalshi",
  williamhill: "William Hill",
};

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

export function EventCard({ event }: { event: OddsEvent }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{SOURCE_LABEL[event.source]}</Text>
        </View>
        <Text style={styles.volume}>{formatVolume(event.volume)} VOL</Text>
      </View>
      <Text style={styles.title}>{event.title}</Text>
      <View style={styles.outcomes}>
        {event.outcomes.map((o) => (
          <View key={o.name} style={styles.outcomeRow}>
            <Text style={styles.outcomeName} numberOfLines={1}>
              {o.name}
            </Text>
            <Text style={styles.outcomeProb}>{Math.round(o.impliedProbability * 100)}%</Text>
          </View>
        ))}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.2,
    color: colors.textPrimary,
  },
  volume: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: font,
    letterSpacing: 0.3,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: fontMedium,
    marginBottom: 12,
  },
  outcomes: {
    gap: 8,
  },
  outcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  outcomeName: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: font,
    flexShrink: 1,
    marginRight: 8,
  },
  outcomeProb: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    fontFamily: fontMedium,
    fontVariant: ["tabular-nums"],
  },
});
