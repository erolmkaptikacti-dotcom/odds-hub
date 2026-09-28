import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { API_BASE_URL, POLL_INTERVAL_MS } from "@/config";
import { usePolledFetch } from "@/hooks/usePolledFetch";
import { EventCard } from "@/components/EventCard";
import { colors, fontMedium } from "@/theme";
import { sharedStyles } from "@/sharedStyles";
import type { EventsResponse } from "@/types";

/** One card per source per market — used for sports we haven't built game-matching for yet. */
export function EventsView({
  sport,
  league,
  onScroll,
  contentBottomPadding = 24,
}: {
  sport: string;
  league?: string;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  contentBottomPadding?: number;
}) {
  const url = league
    ? `${API_BASE_URL}/api/events?sport=${sport}&league=${league}`
    : `${API_BASE_URL}/api/events?sport=${sport}`;
  const { data, error, loading, refreshing, refresh } = usePolledFetch<EventsResponse>(url, POLL_INTERVAL_MS);

  return (
    <>
      {data?.demo && (
        <View style={styles.demoRow}>
          <Text style={styles.demoBadge}>DEMO DATA</Text>
        </View>
      )}

      {loading && !data && (
        <View style={sharedStyles.centerBox}>
          <Text style={sharedStyles.muted}>Loading odds…</Text>
        </View>
      )}

      {error && (
        <View style={sharedStyles.centerBox}>
          <Text style={sharedStyles.errorText}>Couldn&apos;t reach the server: {error}</Text>
          <Text style={sharedStyles.muted}>Is apps/server running? See src/config.ts.</Text>
        </View>
      )}

      {data && data.events.length === 0 && (
        <View style={sharedStyles.centerBox}>
          <Text style={sharedStyles.muted}>No {sport.toUpperCase()} events right now.</Text>
        </View>
      )}

      <FlatList
        data={data?.events ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: contentBottomPadding }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textPrimary} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
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
