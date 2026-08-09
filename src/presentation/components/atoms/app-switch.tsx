import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
} from "react-native";

import { getPressedSwitchTrackColor } from "@/presentation/helpers/controls/app-switch-colors";
import { appColors } from "@/presentation/theme/colors";

const SWITCH_TRAVEL = 18;
const SWITCH_OVERSHOOT = 1;
const SWITCH_DURATION_MS = 350;
const TRACK_DURATION_MS = 160;
const SWITCH_EASING = Easing.bezier(0.34, 1.35, 0.64, 1);

type AppSwitchProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function AppSwitch(props: AppSwitchProps) {
  const { accessibilityLabel, disabled = false, value, onValueChange } = props;
  const hasMountedRef = useRef(false);
  const [thumbTranslateX] = useState(
    () => new Animated.Value(value ? SWITCH_TRAVEL : 0),
  );
  const [trackProgress] = useState(() => new Animated.Value(value ? 1 : 0));
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
      if (isMounted) {
        setIsReduceMotionEnabled(isEnabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setIsReduceMotionEnabled,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const targetTranslateX = value ? SWITCH_TRAVEL : 0;
    const targetProgress = value ? 1 : 0;

    if (!hasMountedRef.current || isReduceMotionEnabled) {
      hasMountedRef.current = true;
      thumbTranslateX.setValue(targetTranslateX);
      trackProgress.setValue(targetProgress);
      return;
    }

    const overshootTranslateX = value
      ? SWITCH_TRAVEL + SWITCH_OVERSHOOT
      : -SWITCH_OVERSHOOT;

    const thumbAnimation = Animated.sequence([
      Animated.timing(thumbTranslateX, {
        duration: SWITCH_DURATION_MS * 0.55,
        easing: SWITCH_EASING,
        toValue: overshootTranslateX,
        useNativeDriver: true,
      }),
      Animated.timing(thumbTranslateX, {
        duration: SWITCH_DURATION_MS * 0.25,
        easing: SWITCH_EASING,
        toValue: targetTranslateX,
        useNativeDriver: true,
      }),
      Animated.timing(thumbTranslateX, {
        duration: SWITCH_DURATION_MS * 0.2,
        easing: SWITCH_EASING,
        toValue: targetTranslateX,
        useNativeDriver: true,
      }),
    ]);

    const trackAnimation = Animated.timing(trackProgress, {
      duration: TRACK_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      toValue: targetProgress,
      useNativeDriver: false,
    });

    Animated.parallel([thumbAnimation, trackAnimation]).start();
  }, [isReduceMotionEnabled, thumbTranslateX, trackProgress, value]);

  const handlePress = () => {
    if (disabled) {
      return;
    }

    onValueChange(!value);
  };

  const trackBackgroundColor = trackProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["#F3F4F6", appColors.black],
  });
  const trackBorderColor = trackProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["#D7DADF", appColors.black],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={8}
      style={[styles.track, disabled && styles.trackDisabled]}
      onPress={handlePress}
    >
      {({ pressed }) => (
        <>
          <Animated.View
            style={[
              styles.trackFill,
              {
                backgroundColor:
                  pressed && !disabled
                    ? getPressedSwitchTrackColor(value)
                    : trackBackgroundColor,
                borderColor:
                  pressed && !disabled
                    ? getPressedSwitchTrackColor(value)
                    : trackBorderColor,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.thumb,
              {
                transform: [{ translateX: thumbTranslateX }],
              },
              disabled && styles.thumbDisabled,
            ]}
          />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  thumb: {
    backgroundColor: appColors.white,
    borderRadius: 13,
    height: 26,
    shadowColor: appColors.black,
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    width: 26,
  },
  thumbDisabled: {
    backgroundColor: "#D7DADF",
  },
  track: {
    borderRadius: 999,
    height: 32,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 4,
    width: 52,
  },
  trackDisabled: {
    opacity: 0.48,
  },
  trackFill: {
    bottom: 0,
    borderRadius: 999,
    borderWidth: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
