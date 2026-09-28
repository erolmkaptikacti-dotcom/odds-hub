import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontMedium } from "@/theme";

export type BottomTab = "home" | "live" | "account" | "settings";

const TABS: { key: BottomTab; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { key: "live", label: "Live", icon: "radio-outline", activeIcon: "radio" },
  { key: "account", label: "Account", icon: "person-circle-outline", activeIcon: "person-circle" },
  { key: "settings", label: "Settings", icon: "settings-outline", activeIcon: "settings" },
];

export const TAB_BAR_HEIGHT = 62 + (Platform.OS === "ios" ? 20 : 0);

export function BottomTabBar({
  active,
  onSelect,
  translateY,
}: {
  active: BottomTab;
  onSelect: (tab: BottomTab) => void;
  translateY: Animated.Value;
}) {
  return (
    <Animated.View style={[styles.bar, { transform: [{ translateY }] }]}>
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Pressable key={t.key} style={styles.tab} onPress={() => onSelect(t.key)} hitSlop={8}>
            <Ionicons
              name={isActive ? t.activeIcon : t.icon}
              size={24}
              color={isActive ? colors.accent : colors.tabBarInactive}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: TAB_BAR_HEIGHT,
    flexDirection: "row",
    backgroundColor: colors.tabBarBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.tabBarBorder,
    paddingBottom: Platform.OS === "ios" ? 20 : 6,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: fontMedium,
    color: colors.tabBarInactive,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: colors.accent,
    fontWeight: "700",
  },
});
