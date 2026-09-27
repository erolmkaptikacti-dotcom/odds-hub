import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { API_BASE_URL, POLL_INTERVAL_MS } from "@/config";
import { usePolledFetch } from "@/hooks/usePolledFetch";
import { GameCard } from "@/components/GameCard";
import { colors, fontMedium } from "@/theme";
import { sharedStyles } from "@/sharedStyles";
import type { GameOdds, GamesResponse } from "@/types";

/** The per-game moneyline slate (Polymarket + Kalshi side by side), used for sports with a team-matchup market. */
export function GamesView({ sport, onSelectGame }: { sport: string; onSelectGame: (game: GameOdds) => void }) {
  const { data, error, loading, refreshing, refresh } = usePolledFetch<GamesResponse>(
    `${API_BASE_URL}/api/games?sport=${sport}`,
    POLL_INTERVAL_MS
  );

  return (
    <>
      {data?.demo && (
        <View style={styles.demoRow}>
          <Text style={styles.demoBadge}>DEMO DATA</Text>
        </View>
      )}

      {loading && !data && (
        <View style={sharedStyles.centerBox}>
          <Text style={sharedStyles.muted}>Loading the slate…</Text>
        </View>
      )}

      {error && (
        <View style={sharedStyles.centerBox}>
          <Text style={sharedStyles.errorText}>Couldn&apos;t reach the server: {error}</Text>
          <Text style={sharedStyles.muted}>Is apps/server running? See src/config.ts.</Text>
        </View>
      )}

      {data && data.games.length === 0 && (
        <View style={sharedStyles.centerBox}>
          <Text style={sharedStyles.muted}>No {sport.toUpperCase()} games on the board right now.</Text>
        </View>
      )}

      <FlatList
        data={data?.games ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GameCard game={item} onPress={() => onSelectGame(item)} />}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textPrimary} />}
      />
    </>
  );
}

const styles = StyleSheet.create({
  demoRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  demoBadge: {
    alignSelf: "flex-start",
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.3,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
