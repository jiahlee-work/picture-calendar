import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { AppBottomSheetBackdrop } from "@/presentation/components/atoms/app-bottom-sheet-backdrop";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";

type RecapTextColorSheetProps = {
  value: string;
  visible: boolean;
  onChangeColor: (color: string) => void;
  onClose: () => void;
};

const BASIC_TEXT_COLOR_OPTIONS = [
  "#121212",
  "#FFFFFF",
  "#EF4444",
  "#F97316",
  "#FACC15",
  "#22C55E",
  "#38BDF8",
  "#6366F1",
  "#A855F7",
  "#EC4899",
  "#94A3B8",
  "#78716C",
];

const CUSTOM_PICKER_MAX_SIZE = 330;
const HUE_BAR_HEIGHT = 34;

export function RecapTextColorSheet(props: RecapTextColorSheetProps) {
  const { onChangeColor, onClose, value, visible } = props;
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isPresentedRef = useRef(false);
  const insets = useSafeAreaInsets();
  const [isCustomPickerVisible, setIsCustomPickerVisible] = useState(false);
  const snapPoints = useMemo(
    () => (isCustomPickerVisible ? ["60%"] : ["32%"]),
    [isCustomPickerVisible],
  );
  const colorRows = useMemo(
    () => [
      BASIC_TEXT_COLOR_OPTIONS.slice(0, 6),
      BASIC_TEXT_COLOR_OPTIONS.slice(6, 12),
    ],
    [],
  );

  useEffect(() => {
    if (visible) {
      isPresentedRef.current = true;
      bottomSheetRef.current?.present();
      return;
    }

    if (isPresentedRef.current) {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleDismiss = () => {
    isPresentedRef.current = false;
    setIsCustomPickerVisible(false);
    onClose();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      backdropComponent={AppBottomSheetBackdrop}
      backgroundStyle={styles.sheetBackground}
      containerStyle={styles.sheetContainer}
      enableDynamicSizing={false}
      enableContentPanningGesture={!isCustomPickerVisible}
      enableHandlePanningGesture={!isCustomPickerVisible}
      enableOverDrag={false}
      enablePanDownToClose
      handleIndicatorStyle={styles.handleIndicator}
      index={0}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
    >
      <BottomSheetView
        style={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 18),
          },
        ]}
      >
        <Text style={styles.title}>색상</Text>
        {isCustomPickerVisible ? (
          <CustomColorPicker value={value} onChangeColor={onChangeColor} />
        ) : (
          <View style={styles.palette}>
            {colorRows.map((row) => (
              <View key={row.join("-")} style={styles.paletteRow}>
                {row.map((color) => (
                  <ColorChip
                    key={color}
                    color={color}
                    isSelected={color.toLowerCase() === value.toLowerCase()}
                    onPress={() => onChangeColor(color)}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isCustomPickerVisible
              ? "기본 텍스트 색상만 보기"
              : "텍스트 색상 더 보기"
          }
          style={({ pressed }) => [
            styles.moreButton,
            pressed && styles.pressedButton,
          ]}
          onPress={() => setIsCustomPickerVisible((current) => !current)}
        >
          <View style={styles.moreButtonIcon}>
            <View style={[styles.moreButtonDot, styles.redDot]} />
            <View style={[styles.moreButtonDot, styles.yellowDot]} />
            <View style={[styles.moreButtonDot, styles.blueDot]} />
          </View>
          <Text style={styles.moreButtonText}>
            {isCustomPickerVisible ? "기본 색상만 보기" : "텍스트 색상 더 보기"}
          </Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

function ColorChip(props: {
  color: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { color, isSelected, onPress } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${color} 색상 선택`}
      accessibilityState={{ selected: isSelected }}
      style={({ pressed }) => [
        styles.colorButton,
        isSelected && styles.selectedColorButton,
        pressed && styles.pressedButton,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.colorSwatch,
          {
            backgroundColor: color,
          },
          color === "#FFFFFF" && styles.whiteColorSwatch,
        ]}
      />
    </Pressable>
  );
}

function CustomColorPicker(props: {
  value: string;
  onChangeColor: (color: string) => void;
}) {
  const { onChangeColor, value } = props;
  const { width } = useWindowDimensions();
  const pickerSize = Math.min(width - 92, CUSTOM_PICKER_MAX_SIZE);
  const sliderWidth = pickerSize;
  const initialColor = useMemo(() => hexToHsv(value), [value]);
  const [hue, setHue] = useState(initialColor.hue);
  const [saturation, setSaturation] = useState(initialColor.saturation);
  const [brightness, setBrightness] = useState(initialColor.brightness);
  const hueColor = hsvToHex(hue, 1, 1);
  const updatePickerFromEvent = useCallback(
    (locationX: number, locationY: number) => {
      const nextSaturation = clamp(locationX / pickerSize, 0, 1);
      const nextBrightness = clamp(1 - locationY / pickerSize, 0, 1);
      const nextHexColor = hsvToHex(hue, nextSaturation, nextBrightness);

      setSaturation(nextSaturation);
      setBrightness(nextBrightness);
      onChangeColor(nextHexColor);
    },
    [hue, onChangeColor, pickerSize],
  );
  const updateHueFromEvent = useCallback(
    (locationX: number) => {
      const nextHue = clamp(locationX / sliderWidth, 0, 1) * 360;
      const nextHexColor = hsvToHex(nextHue, saturation, brightness);

      setHue(nextHue);
      onChangeColor(nextHexColor);
    },
    [brightness, onChangeColor, saturation, sliderWidth],
  );
  const pickerPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (event) => {
          updatePickerFromEvent(
            event.nativeEvent.locationX,
            event.nativeEvent.locationY,
          );
        },
        onPanResponderMove: (event) => {
          updatePickerFromEvent(
            event.nativeEvent.locationX,
            event.nativeEvent.locationY,
          );
        },
      }),
    [updatePickerFromEvent],
  );
  const huePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (event) => {
          updateHueFromEvent(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
          updateHueFromEvent(event.nativeEvent.locationX);
        },
      }),
    [updateHueFromEvent],
  );
  return (
    <View style={styles.customPicker}>
      <View
        {...pickerPanResponder.panHandlers}
        style={[
          styles.colorField,
          {
            height: pickerSize,
            width: pickerSize,
          },
        ]}
      >
        <Svg height={pickerSize} width={pickerSize}>
          <Defs>
            <LinearGradient
              id="textColorWhiteOverlay"
              x1="0"
              x2="1"
              y1="0"
              y2="0"
            >
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
            <LinearGradient
              id="textColorBlackOverlay"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <Stop offset="0" stopColor="#000000" stopOpacity="0" />
              <Stop offset="1" stopColor="#000000" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect fill={hueColor} height={pickerSize} width={pickerSize} />
          <Rect
            fill="url(#textColorWhiteOverlay)"
            height={pickerSize}
            width={pickerSize}
          />
          <Rect
            fill="url(#textColorBlackOverlay)"
            height={pickerSize}
            width={pickerSize}
          />
          <Circle
            cx={saturation * pickerSize}
            cy={(1 - brightness) * pickerSize}
            fill="none"
            r={11}
            stroke="#FFFFFF"
            strokeWidth={3}
          />
        </Svg>
      </View>
      <View
        {...huePanResponder.panHandlers}
        style={[
          styles.hueBar,
          {
            width: sliderWidth,
          },
        ]}
      >
        <Svg height={HUE_BAR_HEIGHT} width={sliderWidth}>
          <Defs>
            <LinearGradient id="textColorHue" x1="0" x2="1" y1="0" y2="0">
              <Stop offset="0" stopColor="#FF0000" />
              <Stop offset="0.17" stopColor="#FFFF00" />
              <Stop offset="0.33" stopColor="#00FF00" />
              <Stop offset="0.5" stopColor="#00FFFF" />
              <Stop offset="0.67" stopColor="#0000FF" />
              <Stop offset="0.83" stopColor="#FF00FF" />
              <Stop offset="1" stopColor="#FF0000" />
            </LinearGradient>
          </Defs>
          <Rect
            fill="url(#textColorHue)"
            height={HUE_BAR_HEIGHT}
            rx={HUE_BAR_HEIGHT / 2}
            width={sliderWidth}
          />
          <Circle
            cx={(hue / 360) * sliderWidth}
            cy={HUE_BAR_HEIGHT / 2}
            fill={hueColor}
            r={16}
            stroke="#FFFFFF"
            strokeWidth={3}
          />
        </Svg>
      </View>
    </View>
  );
}

function hsvToHex(hue: number, saturation: number, value: number): string {
  const chroma = value * saturation;
  const huePrime = hue / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  const [red1, green1, blue1] =
    huePrime < 1
      ? [chroma, x, 0]
      : huePrime < 2
        ? [x, chroma, 0]
        : huePrime < 3
          ? [0, chroma, x]
          : huePrime < 4
            ? [0, x, chroma]
            : huePrime < 5
              ? [x, 0, chroma]
              : [chroma, 0, x];
  const match = value - chroma;
  const red = Math.round((red1 + match) * 255);
  const green = Math.round((green1 + match) * 255);
  const blue = Math.round((blue1 + match) * 255);

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function hexToHsv(hexColor: string): {
  brightness: number;
  hue: number;
  saturation: number;
} {
  const normalizedHex = hexColor.replace("#", "");
  const red = Number.parseInt(normalizedHex.slice(0, 2), 16) / 255;
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const saturation = max === 0 ? 0 : delta / max;
  const brightness = max;
  const hue =
    delta === 0
      ? 0
      : max === red
        ? 60 * (((green - blue) / delta) % 6)
        : max === green
          ? 60 * ((blue - red) / delta + 2)
          : 60 * ((red - green) / delta + 4);

  return {
    brightness,
    hue: hue < 0 ? hue + 360 : hue,
    saturation,
  };
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, "0").toUpperCase();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const styles = StyleSheet.create({
  blueDot: {
    backgroundColor: "#2563EB",
    bottom: 5,
    right: 5,
  },
  colorButton: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 24,
    borderWidth: 3,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  colorField: {
    borderRadius: 2,
    overflow: "hidden",
  },
  colorSwatch: {
    borderRadius: 19,
    height: 38,
    width: 38,
  },
  content: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  customPicker: {
    alignItems: "center",
    gap: 18,
    justifyContent: "center",
    paddingTop: 4,
  },
  handleIndicator: {
    backgroundColor: "#dddddd",
    width: 42,
  },
  hueBar: {
    borderRadius: HUE_BAR_HEIGHT / 2,
    height: HUE_BAR_HEIGHT,
    overflow: "hidden",
  },
  moreButton: {
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    borderRadius: 24,
    flexDirection: "row",
    gap: 12,
    height: 48,
    justifyContent: "center",
  },
  moreButtonDot: {
    borderRadius: 7,
    height: 14,
    position: "absolute",
    width: 14,
  },
  moreButtonIcon: {
    height: 28,
    position: "relative",
    width: 28,
  },
  moreButtonText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22,
  },
  palette: {
    gap: 14,
  },
  paletteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pressedButton: {
    opacity: 0.62,
  },
  redDot: {
    backgroundColor: "#EF4444",
    left: 4,
    top: 4,
  },
  selectedColorButton: {
    borderColor: appColors.black,
  },
  sheetBackground: {
    backgroundColor: appColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContainer: {
    elevation: appLayers.bottomSheet,
    zIndex: appLayers.bottomSheet,
  },
  title: {
    color: appColors.black,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
    textAlign: "center",
  },
  whiteColorSwatch: {
    borderColor: "rgba(18,18,18,0.18)",
    borderWidth: 1,
  },
  yellowDot: {
    backgroundColor: "#FACC15",
    right: 4,
    top: 4,
  },
});
