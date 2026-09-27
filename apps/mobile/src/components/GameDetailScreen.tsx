import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { API_BASE_URL } from "@/config";
import { usePolledFetch } from "@/hooks/usePolledFetch";
import { colors, font, fontMedium } from "@/theme";
import { sharedStyles } from "@/sharedStyles";
import type { GameOdds, GameProps, GamePropsResponse, PropCategory, PropLine } from "@/types";

const SOURCE_BRAND_COLOR = {
  polymarket: "#1652F0",
  kalshi: "#00D298",
};

const CATEGORIES: { key: PropCategory; label: string }[] = [
  { key: "anytimeTd", label: "Anytime TD" },
  { key: "passing", label: "Passing Yards" },
  { key: "rushing", label: "Rushing Yards" },
  { key: "receiving", label: "Receiving Yards" },
];

// The market question already names the player before "Over/Under N
// yards?" (or just "Anytime Touchdown") — strip that part off so we can
// show the player's name as its own line and the number as its own big
// stat, instead of one long sentence.
function playerName(label: string): string {
  const idx = label.search(/\b(over|under|anytime)\b/i);
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
        <Text style={styles.propLine}>{prop.line !== null ? `${prop.line} yds` : "—"}</Text>
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

function SourcePropsSection({
  label,
  brandColor,
  lines,
  available,
}: {
  label: string;
  brandColor: string;
  lines: PropLine[];
  available: boolean;
}) {
  return (
    <View style={styles.sourceSection}>
      <Text style={[styles.sourceLabel, { color: brandColor }]}>{label}</Text>
      {!available && <Text style={sharedStyles.muted}>Not available yet</Text>}
      {available && lines.length === 0 && <Text style={sharedStyles.muted}>No lines found</Text>}
      {lines.map((p, i) => (
        <PropRow key={i} prop={p} />
      ))}
    </View>
  );
}

export function GameDetailScreen({ game }: { game: GameOdds }) {
  const [category, setCategory] = useState<PropCategory>("anytimeTd");
  const { data, error, loading } = usePolledFetch<GamePropsResponse>(
    `${API_BASE_URL}/api/props?sport=${game.sport}&gameId=${game.id}`,
    30_000
  );

  const empty: GameProps = { anytimeTd: [], passing: [], rushing: [], receiving: [] };

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

      <View style={styles.categoryRow}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.key}
            onPress={() => setCategory(c.key)}
            style={[styles.categoryChip, category === c.key && styles.categoryChipActive]}
          >
            <Text style={[styles.categoryChipText, category === c.key && styles.categoryChipTextActive]}>
              {c.label}
            </Text>
          </Pressable>
        ))}
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
        <View style={styles.body}>
          <SourcePropsSection
            label="POLYMARKET"
            brandColor={SOURCE_BRAND_COLOR.polymarket}
            lines={(data.polymarket ?? empty)[category]}
            available={data.polymarket !== null}
          />
          <View style={styles.sourcesGap} />
          <SourcePropsSection
            label="KALSHI"
            brandColor={SOURCE_BRAND_COLOR.kalshi}
            lines={(data.kalshi ?? empty)[category]}
            available={data.kalshi !== null}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
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
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 2,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.invertedBg,
    borderColor: colors.invertedBg,
  },
  categoryChipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: fontMedium,
  },
  categoryChipTextActive: {
    color: colors.invertedText,
  },
  body: {
    paddingHorizontal: 16,
  },
  sourcesGap: {
    height: 32,
  },
  sourceSection: {
    flex: 1,
  },
  sourceLabel: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: fontMedium,
    letterSpacing: 0.6,
    marginBottom: 14,
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
