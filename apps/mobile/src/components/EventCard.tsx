import { StyleSheet, Text, View } from "react-native";
import type { OddsEvent } from "@/types";

const SOURCE_LABEL: Record<OddsEvent["source"], string> = {
  polymarket: "Polymarket",
  kalshi: "Kalshi",
};

const SOURCE_COLOR: Record<OddsEvent["source"], string> = {
  polymarket: "#6d5ce8",
  kalshi: "#2fbf71",
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
        <View style={[styles.badge, { backgroundColor: `${SOURCE_COLOR[event.source]}26` }]}>
          <Text style={[styles.badgeText, { color: SOURCE_COLOR[event.source] }]}>
            {SOURCE_LABEL[event.source]}
          </Text>
        </View>
        <Text style={styles.volume}>{formatVolume(event.volume)} vol</Text>
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
    backgroundColor: "#11151f",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(148,163,197,0.14)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  volume: {
    color: "#6d7890",
    fontSize: 11,
  },
  title: {
    color: "#eef1f8",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  outcomes: {
    gap: 6,
  },
  outcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  outcomeName: {
    color: "#aab3c7",
    fontSize: 13,
    flexShrink: 1,
    marginRight: 8,
  },
  outcomeProb: {
    color: "#eef1f8",
    fontSize: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
