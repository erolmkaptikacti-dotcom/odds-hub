import { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { API_BASE_URL, POLL_INTERVAL_MS, SPORTS } from "@/config";
import { usePolledFetch } from "@/hooks/usePolledFetch";
import { EventCard } from "@/components/EventCard";
import { colors, font, fontMedium } from "@/theme";
import type { EventsResponse } from "@/types";

export default function App() {
  const [sport, setSport] = useState<string>(SPORTS[0].key);
  const { data, error, loading, refreshing, refresh } = usePolledFetch<EventsResponse>(
    `${API_BASE_URL}/api/events?sport=${sport}`,
    POLL_INTERVAL_MS
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerRow}>
        <Text style={styles.title}>OddsHub</Text>
        {data?.demo && <Text style={styles.demoBadge}>DEMO DATA</Text>}
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

      {loading && !data && (
        <View style={styles.centerBox}>
          <Text style={styles.muted}>Loading odds…</Text>
        </View>
      )}

      {error && (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>Couldn&apos;t reach the server: {error}</Text>
          <Text style={styles.muted}>Is apps/server running? See src/config.ts.</Text>
        </View>
      )}

      {data && data.events.length === 0 && (
        <View style={styles.centerBox}>
          <Text style={styles.muted}>No {sport.toUpperCase()} events right now.</Text>
        </View>
      )}

      <FlatList
        data={data?.events ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textPrimary} />}
      />
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
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    fontFamily: fontMedium,
    letterSpacing: 0.5,
  },
  demoBadge: {
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
  centerBox: {
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: font,
    textAlign: "center",
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontFamily: font,
    fontWeight: "600",
    textAlign: "center",
  },
});
