import { useMemo, useState } from "react";
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { API_BASE_URL } from "@/config";
import { usePolledFetch } from "@/hooks/usePolledFetch";
import { useSlideTransition } from "@/hooks/useSlideTransition";
import { colors, font, fontMedium } from "@/theme";
import { sharedStyles } from "@/sharedStyles";
import { contrastText, teamStyle, teamStyleByAbbr } from "@/lib/nflTeamStyles";
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
const CATEGORY_ORDER = CATEGORIES.map((c) => c.key);

// A neutral rotating palette for player avatars — not team colors, since
// we don't reliably know which team a player is on (see mergeGames.ts).
const AVATAR_COLORS = ["#3a5a78", "#6b4e8c", "#3c7a5c", "#8c5a3c", "#5a5a8c", "#7a3c5c"];

function hashColor(name: string): string {
  const sum = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// Markets that share the same server-provided playerName (see
// apps/server/src/lib/polymarket.ts's extractPlayerName) group into one
// card with a ladder of lines to pick from.
interface PlayerGroup {
  name: string;
  headshotUrl?: string;
  team?: string;
  lines: PropLine[];
}

function groupByPlayer(props: PropLine[]): PlayerGroup[] {
  const order: string[] = [];
  const byName = new Map<string, PropLine[]>();
  for (const p of props) {
    if (!byName.has(p.playerName)) {
      byName.set(p.playerName, []);
      order.push(p.playerName);
    }
    byName.get(p.playerName)!.push(p);
  }
  return order.map((name) => {
    const lines = [...byName.get(name)!].sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
    return {
      name,
      headshotUrl: lines.find((l) => l.headshotUrl)?.headshotUrl,
      team: lines.find((l) => l.team)?.team,
      lines,
    };
  });
}

/** A real headshot when we have one (via Sleeper), falling back to a colored-initials avatar (in the player's real team color, when known) otherwise — including if the image itself fails to load. */
function PlayerAvatar({ name, headshotUrl, accentColor }: { name: string; headshotUrl?: string; accentColor: string }) {
  const [errored, setErrored] = useState(false);
  if (headshotUrl && !errored) {
    return (
      <View style={[styles.avatarRing, { borderColor: accentColor }]}>
        <Image
          source={{ uri: headshotUrl }}
          style={styles.avatar}
          onError={() => setErrored(true)}
          accessibilityLabel={name}
        />
      </View>
    );
  }
  return (
    <View style={[styles.avatar, { backgroundColor: accentColor }]}>
      <Text style={styles.avatarText}>{initials(name)}</Text>
    </View>
  );
}

function PlayerPropCard({ group }: { group: PlayerGroup }) {
  const midIndex = Math.floor((group.lines.length - 1) / 2);
  const [selected, setSelected] = useState(midIndex);
  const active = group.lines[selected];
  const over = active.overProbability;
  const under = over === null ? null : 1 - over;

  const teamInfo = teamStyleByAbbr(group.team);
  const accentColor = teamInfo?.color ?? hashColor(group.name);

  return (
    <View style={[styles.playerCard, { borderLeftColor: accentColor }]}>
      <View style={styles.playerRow}>
        <PlayerAvatar name={group.name} headshotUrl={group.headshotUrl} accentColor={accentColor} />
        <Text style={styles.playerName}>{group.name}</Text>
        {teamInfo && (
          <View style={[styles.teamChip, { backgroundColor: teamInfo.color }]}>
            <Text style={[styles.teamChipText, { color: contrastText(teamInfo.color) }]}>{teamInfo.abbr}</Text>
          </View>
        )}
      </View>

      {active.line !== null && (
        <View style={styles.projectedRow}>
          <Text style={styles.projectedLabel}>PROJECTED</Text>
          <Text style={styles.projectedValue}>
            {active.line}
            <Text style={styles.projectedUnit}> yds</Text>
          </Text>
        </View>
      )}

      <View style={styles.oddsPills}>
        <View style={[styles.oddsPill, styles.oddsPillYes]}>
          <Text style={styles.oddsPillLabel}>YES</Text>
          <Text style={[styles.oddsPillValue, styles.oddsPillValueYes]}>
            {over === null ? "—" : `${Math.round(over * 100)}%`}
          </Text>
        </View>
        <View style={[styles.oddsPill, styles.oddsPillNo]}>
          <Text style={styles.oddsPillLabel}>NO</Text>
          <Text style={[styles.oddsPillValue, styles.oddsPillValueNo]}>
            {under === null ? "—" : `${Math.round(under * 100)}%`}
          </Text>
        </View>
      </View>

      {group.lines.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ladderScroller}>
          {group.lines.map((line, i) => (
            <Pressable
              key={i}
              onPress={() => setSelected(i)}
              style={[styles.ladderPill, i === selected && styles.ladderPillActive]}
            >
              <Text style={[styles.ladderPillText, i === selected && styles.ladderPillTextActive]}>
                {line.line !== null ? `${line.line}+` : "—"}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
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
  const groups = useMemo(() => groupByPlayer(lines), [lines]);
  return (
    <View style={styles.sourceSection}>
      <Text style={[styles.sourceLabel, { color: brandColor }]}>{label}</Text>
      {!available && <Text style={sharedStyles.muted}>Not available yet</Text>}
      {available && groups.length === 0 && <Text style={sharedStyles.muted}>No lines found</Text>}
      {groups.map((g) => (
        <PlayerPropCard key={g.name} group={g} />
      ))}
    </View>
  );
}

export function GameDetailScreen({ game }: { game: GameOdds }) {
  const [category, setCategory] = useState<PropCategory>("anytimeTd");
  const slideStyle = useSlideTransition(category, CATEGORY_ORDER);
  const { data, error, loading } = usePolledFetch<GamePropsResponse>(
    `${API_BASE_URL}/api/props?sport=${game.sport}&gameId=${game.id}`,
    30_000
  );

  const empty: GameProps = { anytimeTd: [], passing: [], rushing: [], receiving: [] };

  const teamAColor = teamStyle(game.teamA).color;
  const teamBColor = teamStyle(game.teamB).color;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.splitBorder}>
        <View style={[styles.splitHalf, { backgroundColor: teamAColor }]} />
        <View style={[styles.splitHalf, { backgroundColor: teamBColor }]} />
      </View>

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroller}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORIES.map((c) => (
          <Pressable key={c.key} onPress={() => setCategory(c.key)} style={styles.categoryTab}>
            <Text style={[styles.categoryTabText, category === c.key && styles.categoryTabTextActive]}>
              {c.label}
            </Text>
            {category === c.key && <View style={styles.categoryUnderline} />}
          </Pressable>
        ))}
      </ScrollView>

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
        <Animated.View style={[styles.body, slideStyle]}>
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
        </Animated.View>
      )}
    </ScrollView>
  );
}

const BORDER_HEIGHT = 5;

const styles = StyleSheet.create({
  splitBorder: {
    flexDirection: "row",
    height: BORDER_HEIGHT,
  },
  splitHalf: {
    flex: 1,
  },
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
    letterSpacing: 0.3,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryScroller: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 26,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  categoryTab: {
    alignItems: "center",
  },
  categoryTabText: {
    color: colors.textMuted,
    fontSize: 19,
    fontWeight: "600",
    fontFamily: fontMedium,
  },
  categoryTabTextActive: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  categoryUnderline: {
    marginTop: 8,
    height: 3,
    width: "100%",
    borderRadius: 2,
    backgroundColor: colors.textPrimary,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  sourcesGap: {
    height: 28,
  },
  sourceSection: {
    flex: 1,
  },
  sourceLabel: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.2,
    marginBottom: 14,
  },
  playerCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderLeftWidth: 4,
    padding: 14,
    paddingLeft: 12,
    marginBottom: 12,
    gap: 12,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: fontMedium,
  },
  playerName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: fontMedium,
    flexWrap: "wrap",
  },
  teamChip: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  teamChipText: {
    fontSize: 11,
    fontWeight: "800",
    fontFamily: fontMedium,
    letterSpacing: 0.3,
  },
  projectedRow: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  projectedLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.5,
  },
  projectedValue: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "700",
    fontFamily: fontMedium,
    fontVariant: ["tabular-nums"],
  },
  projectedUnit: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  oddsPills: {
    flexDirection: "row",
    gap: 8,
  },
  oddsPill: {
    flex: 1,
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  oddsPillYes: {
    borderColor: "#2fbf71",
    backgroundColor: "rgba(47,191,113,0.12)",
  },
  oddsPillNo: {
    borderColor: "#e5544b",
    backgroundColor: "rgba(229,84,75,0.12)",
  },
  oddsPillLabel: {
    fontSize: 9,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.3,
    color: colors.textMuted,
  },
  oddsPillValue: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: fontMedium,
    fontVariant: ["tabular-nums"],
  },
  oddsPillValueYes: {
    color: "#3ddc85",
  },
  oddsPillValueNo: {
    color: "#f0736b",
  },
  ladderScroller: {
    marginLeft: 58, // align under the name, past the avatar
  },
  ladderPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  ladderPillActive: {
    backgroundColor: colors.invertedBg,
    borderColor: colors.invertedBg,
  },
  ladderPillText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: fontMedium,
    fontVariant: ["tabular-nums"],
  },
  ladderPillTextActive: {
    color: colors.invertedText,
  },
});
