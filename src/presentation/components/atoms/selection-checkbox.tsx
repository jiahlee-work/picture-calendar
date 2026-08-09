import {
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { appColors } from "@/presentation/theme/colors";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const CHECK_PATH_LENGTH = 15;
const CHECK_EASING = Easing.bezier(0.22, 1, 0.36, 1);

type SelectionCheckboxProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  isSelected: boolean;
  onPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function SelectionCheckbox(props: SelectionCheckboxProps) {
  const {
    accessibilityLabel,
    disabled = false,
    isSelected,
    onPress,
    size = 28,
    style,
  } = props;
  const boxProgress = useDerivedValue(() =>
    withTiming(isSelected ? 1 : 0, {
      duration: 150,
      easing: CHECK_EASING,
    }),
  );
  const checkProgress = useDerivedValue(() =>
    withTiming(isSelected ? 1 : 0, {
      duration: isSelected ? 350 : 150,
      easing: CHECK_EASING,
    }),
  );
  const animatedControlStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      boxProgress.value,
      [0, 1],
      [appColors.white, appColors.black],
    ),
    borderColor: interpolateColor(
      boxProgress.value,
      [0, 1],
      ["#D1D5DB", appColors.black],
    ),
  }));
  const animatedCheckProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_PATH_LENGTH * (1 - checkProgress.value),
  }));

  const handlePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress?.();
  };

  return (
    <AnimatedPressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{
        checked: isSelected,
        disabled,
      }}
      disabled={disabled}
      hitSlop={10}
      style={[
        styles.root,
        {
          borderRadius: size / 2,
          height: size,
          width: size,
        },
        animatedControlStyle,
        disabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
    >
      <Svg height={size / 2} viewBox="0 0 10.1668 10.1668" width={size / 2}>
        <AnimatedPath
          animatedProps={animatedCheckProps}
          d="M1 5.52L3.92 9.17L9.17 1"
          fill="none"
          stroke={appColors.white}
          strokeDasharray={CHECK_PATH_LENGTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
        />
      </Svg>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  disabled: {
    backgroundColor: "#F3F4F6",
    opacity: 0.62,
  },
  root: {
    alignItems: "center",
    backgroundColor: appColors.white,
    borderColor: "#D1D5DB",
    borderWidth: 2,
    justifyContent: "center",
  },
});
