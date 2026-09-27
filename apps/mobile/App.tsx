import { useState } from "react";
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { GAME_MATCHING_SPORTS, SPORTS } from "@/config";
import { GamesView } from "@/components/GamesView";
import { EventsView } from "@/components/EventsView";
import { colors, fontMedium } from "@/theme";

export default function App() {
  const [sport, setSport] = useState<string>(SPORTS[0].key);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
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

      {GAME_MATCHING_SPORTS.has(sport) ? <GamesView sport={sport} /> : <EventsView sport={sport} />}
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
});
