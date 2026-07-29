import {
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
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

import type { StickerAsset } from "@/application/services/stickers/types";
import { StickerAssetPreview } from "@/presentation/components/organisms/sticker-asset-preview";
import { appColors } from "@/presentation/theme/colors";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const CHECK_PATH_LENGTH = 15;
const CHECK_EASING = Easing.bezier(0.22, 1, 0.36, 1);

export type StickerTileProps = {
  asset: StickerAsset;
  isSelectable?: boolean;
  isSelected?: boolean;
  selectionMode?: boolean;
  showsSelectionControl?: boolean;
  tileSize: number;
  onOpenDetails: (asset: StickerAsset) => void;
  onToggleSelection?: (asset: StickerAsset) => void;
};

export function StickerTile(props: StickerTileProps) {
  const {
    asset,
    isSelectable = false,
    isSelected = false,
    onOpenDetails,
    onToggleSelection,
    selectionMode = false,
    showsSelectionControl = isSelectable,
    tileSize,
  } = props;
  const title = asset.name ?? "Sticker";
  const accessibilityHint = isSelectable
    ? "탭하여 스티커 선택, 길게 눌러 스티커 상세보기"
    : selectionMode
      ? "스티커 선택 상태 변경"
      : "길게 눌러 스티커 상세보기";

  const handlePress = () => {
    if (isSelectable) {
      onToggleSelection?.(asset);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected: isSelected }}
      delayLongPress={260}
      style={({ pressed }) => [
        styles.root,
        isSelected && styles.rootSelected,
        pressed && styles.pressed,
        {
          height: tileSize,
          width: tileSize,
        },
      ]}
      onPress={handlePress}
      onLongPress={() => onOpenDetails(asset)}
    >
      <StickerAssetPreview asset={asset} />
      {showsSelectionControl && (
        <StickerTileSelectionControl
          accessibilityLabel={
            isSelectable ? `${title} 선택` : `${title} 선택 불가`
          }
          disabled={!isSelectable}
          isSelected={isSelected}
          onPress={() => onToggleSelection?.(asset)}
        />
      )}
    </Pressable>
  );
}

function StickerTileSelectionControl(props: {
  accessibilityLabel: string;
  disabled: boolean;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { accessibilityLabel, disabled, isSelected, onPress } = props;
  const handlePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress();
  };
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
        styles.selectionControl,
        animatedControlStyle,
        disabled && styles.selectionControlDisabled,
      ]}
      onPress={handlePress}
    >
      <Svg height={14} viewBox="0 0 10.1668 10.1668" width={14}>
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
  pressed: {
    opacity: 0.72,
  },
  root: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    position: "relative",
  },
  rootSelected: {
    opacity: 0.92,
  },
  selectionControl: {
    alignItems: "center",
    backgroundColor: appColors.white,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    right: 4,
    top: 4,
    width: 28,
  },
  selectionControlDisabled: {
    backgroundColor: "#F3F4F6",
    opacity: 0.62,
  },
});
