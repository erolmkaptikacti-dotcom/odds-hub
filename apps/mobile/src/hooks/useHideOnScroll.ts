import { useMemo, useRef } from "react";
import { Animated, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

// Ignores tiny scroll jitter (momentum settling, a light nudge) so the bar
// only reacts to an actual scroll-up/scroll-down gesture.
const DIRECTION_THRESHOLD = 12;

/** Slides a bar (e.g. a bottom tab bar) out of view on scroll-down and back in on scroll-up or at the top of the list. */
export function useHideOnScroll(barHeight: number) {
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);
  const hidden = useRef(false);

  const show = () => {
    if (!hidden.current) return;
    hidden.current = false;
    Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };

  const hide = () => {
    if (hidden.current) return;
    hidden.current = true;
    Animated.timing(translateY, { toValue: barHeight, duration: 200, useNativeDriver: true }).start();
  };

  const onScroll = useMemo(
    () => (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const diff = y - lastOffset.current;

      if (y <= 0) {
        show();
      } else if (diff > DIRECTION_THRESHOLD) {
        hide();
      } else if (diff < -DIRECTION_THRESHOLD) {
        show();
      }

      if (Math.abs(diff) > DIRECTION_THRESHOLD || y <= 0) {
        lastOffset.current = y;
      }
    },
    [barHeight]
  );

  return { translateY, onScroll, show };
}
