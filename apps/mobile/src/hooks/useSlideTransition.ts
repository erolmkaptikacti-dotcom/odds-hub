import { useEffect, useRef } from "react";
import { Animated } from "react-native";

/**
 * A small slide-in + fade whenever `activeKey` changes, direction-aware via
 * its position in `order` (moving to a later item slides in from the
 * right, an earlier one from the left) — the subtle motion apps like
 * Kalshi use between tabs, instead of content just teleporting in.
 * Built on React Native's own Animated API, so no extra dependency (and
 * no risk of another Expo SDK version mismatch).
 */
export function useSlideTransition(activeKey: string, order: readonly string[], distance = 18) {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const prevKey = useRef(activeKey);

  useEffect(() => {
    if (prevKey.current === activeKey) return;
    const prevIndex = order.indexOf(prevKey.current);
    const nextIndex = order.indexOf(activeKey);
    const direction = nextIndex >= prevIndex ? 1 : -1;
    prevKey.current = activeKey;

    translateX.setValue(direction * distance);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [activeKey, order, distance, translateX, opacity]);

  return { transform: [{ translateX }], opacity };
}
