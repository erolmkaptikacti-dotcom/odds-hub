import { useState } from "react";
import { Animated, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { GAME_MATCHING_SPORTS, SOCCER_LEAGUES, SPORTS } from "@/config";
import { GamesView } from "@/components/GamesView";
import { EventsView } from "@/components/EventsView";
import { GameDetailScreen } from "@/components/GameDetailScreen";
import { OutlineBubble } from "@/components/OutlineBubble";
import { useSlideTransition } from "@/hooks/useSlideTransition";
import { colors, fontMedium } from "@/theme";
import type { GameOdds } from "@/types";

// "detail" always sorts after every sport, so opening a game always slides
// in from the right and going back always slides in from the left;
// switching sports slides left/right based on their order in SPORTS.
const SCREEN_ORDER = [...SPORTS.map((s) => `list:${s.key}`), "detail"];

export default function App() {
  const [sport, setSport] = useState<string>(SPORTS[0].key);
  const [league, setLeague] = useState<string>(SOCCER_LEAGUES[0].id);
  const [selectedGame, setSelectedGame] = useState<GameOdds | null>(null);

  const activeKey = selectedGame ? "detail" : `list:${sport}`;
  const slideStyle = useSlideTransition(activeKey, SCREEN_ORDER);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {selectedGame ? (
        <View style={styles.headerRow}>
          <Pressable onPress={() => setSelectedGame(null)} hitSlop={12}>
            <Text style={styles.backLink}>‹ Back</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.title}>OddsHub</Text>
          </View>

          <View style={styles.sportRow}>
            {SPORTS.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => setSport(s.key)}
                style={[styles.sportChip, sport === s.key && styles.sportChipActive]}
              >
                <Text style={[styles.sportChipText, sport === s.key && styles.sportChipTextActive]}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {sport === "soccer" && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              persistentScrollbar
              indicatorStyle="white"
              contentContainerStyle={styles.leagueRow}
              style={styles.leagueScroller}
            >
              {SOCCER_LEAGUES.map((l) => (
                <OutlineBubble key={l.id} label={l.label} active={league === l.id} onPress={() => setLeague(l.id)} />
              ))}
            </ScrollView>
          )}
        </>
      )}

      <Animated.View style={[{ flex: 1 }, slideStyle]}>
        {selectedGame ? (
          <GameDetailScreen game={selectedGame} />
        ) : GAME_MATCHING_SPORTS.has(sport) ? (
          <GamesView sport={sport} onSelectGame={setSelectedGame} />
        ) : (
          <EventsView sport={sport} league={sport === "soccer" ? league : undefined} />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.5,
  },
  backLink: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: fontMedium,
  },
  sportRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sportChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 2,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  sportChipActive: {
    backgroundColor: colors.invertedBg,
    borderColor: colors.invertedBg,
  },
  sportChipText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: fontMedium,
    letterSpacing: 0.3,
  },
  sportChipTextActive: {
    color: colors.invertedText,
  },
  leagueScroller: {
    marginBottom: 4,
  },
  leagueRow: {
    flexDirection: "row",
    // Horizontal ScrollView children stretch to fill the cross-axis
    // (height) by default when nothing constrains it — that's what
    // ballooned every bubble into a tall oval. alignItems: "flex-start"
    // keeps each bubble sized to its own content instead.
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 18, // room for the scrollbar riding along the bottom edge
  },
});
