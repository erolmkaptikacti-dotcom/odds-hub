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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#4d8dff" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0a0d14",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: {
    color: "#eef1f8",
    fontSize: 22,
    fontWeight: "700",
  },
  demoBadge: {
    color: "#eaa73c",
    fontSize: 10,
    fontWeight: "700",
    backgroundColor: "rgba(234,167,60,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  sportRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sportChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#11151f",
    borderWidth: 1,
    borderColor: "rgba(148,163,197,0.14)",
  },
  sportChipActive: {
    backgroundColor: "#4d8dff",
    borderColor: "#4d8dff",
  },
  sportChipText: {
    color: "#aab3c7",
    fontSize: 13,
    fontWeight: "600",
  },
  sportChipTextActive: {
    color: "#0a0d14",
  },
  centerBox: {
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  muted: {
    color: "#6d7890",
    fontSize: 13,
    textAlign: "center",
  },
  errorText: {
    color: "#e5544b",
    fontSize: 13,
    textAlign: "center",
  },
});
