import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import { sortRecapCanvasElements } from "@/application/services/recap/recap-canvas-elements";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import type { StickerAsset } from "@/application/services/stickers/types";
import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import { PolaroidPhotoFrame } from "@/presentation/components/atoms/polaroid-photo-frame";
import { MessageRecapBubble } from "@/presentation/components/molecules/message-recap-bubble";
import { toCalendarWeeks } from "@/presentation/helpers/calendar/calendar-weeks";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";
import { dayjs } from "@/shared/date/dayjs";
import type {
  RecapCanvasElement,
  RecapCanvasStickerElement,
  RecapCanvasWidgetElement,
} from "@/shared/recap/types";

type RecapCanvasStickerLayerProps = {
  assets: StickerAsset[];
  editingWidgetElementId: string | null;
  elements: RecapCanvasElement[];
  monthKey: string;
  photosById: Record<string, DailyPhoto>;
  selectedElementId: string | null;
  onChangeElement: (
    element: RecapCanvasStickerElement | RecapCanvasWidgetElement,
  ) => void;
  onDeleteElement: (elementId: string) => void;
  onEndWidgetEditing: () => void;
  onSelectElement: (elementId: string | null) => void;
  onStartWidgetEditing: (elementId: string) => void;
};

type RecapCanvasStickerItemProps = {
  asset: StickerAsset | null;
  editingWidgetElementId: string | null;
  element: RecapCanvasStickerElement | RecapCanvasWidgetElement;
  isSelected: boolean;
  monthKey: string;
  photo: DailyPhoto | null;
  onChangeElement: RecapCanvasStickerLayerProps["onChangeElement"];
  onDeleteElement: (elementId: string) => void;
  onEndWidgetEditing: () => void;
  onSelectElement: (elementId: string) => void;
  onStartWidgetEditing: (elementId: string) => void;
};

const DEFAULT_ITEM_SIZE = 132;
const MIN_ELEMENT_SCALE = 0.25;
const MAX_ELEMENT_SCALE = 4;
const DOUBLE_TAP_DELAY_MS = 280;
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function RecapCanvasStickerLayer(props: RecapCanvasStickerLayerProps) {
  const {
    assets,
    editingWidgetElementId,
    elements,
    monthKey,
    onChangeElement,
    onDeleteElement,
    onEndWidgetEditing,
    onSelectElement,
    onStartWidgetEditing,
    photosById,
    selectedElementId,
  } = props;
  const assetsById = useMemo(
    () => new Map(assets.map((asset) => [asset.id, asset])),
    [assets],
  );
  const stickerElements = sortRecapCanvasElements(elements).filter(
    (
      element,
    ): element is RecapCanvasStickerElement | RecapCanvasWidgetElement =>
      element.type === "sticker" || element.type === "widget",
  );

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      {stickerElements.map((element) => {
        const asset =
          element.type === "sticker"
            ? (assetsById.get(element.stickerAssetId) ?? null)
            : null;
        const photo =
          element.type === "widget" &&
          (element.variant === "polaroidFrame" ||
            element.variant === "polaroidFramePortrait")
            ? (photosById[element.photoId ?? ""] ?? null)
            : null;

        return (
          <RecapCanvasStickerItem
            key={element.id}
            asset={asset}
            editingWidgetElementId={editingWidgetElementId}
            element={element}
            isSelected={element.id === selectedElementId}
            monthKey={monthKey}
            photo={photo}
            onChangeElement={onChangeElement}
            onDeleteElement={onDeleteElement}
            onEndWidgetEditing={onEndWidgetEditing}
            onSelectElement={onSelectElement}
            onStartWidgetEditing={onStartWidgetEditing}
          />
        );
      })}
    </View>
  );
}

function RecapCanvasStickerItem(props: RecapCanvasStickerItemProps) {
  const {
    asset,
    editingWidgetElementId,
    element,
    isSelected,
    monthKey,
    onChangeElement,
    onDeleteElement,
    onEndWidgetEditing,
    onSelectElement,
    onStartWidgetEditing,
    photo,
  } = props;
  const lastTapAtRef = useRef(0);
  const wasLongPressedRef = useRef(false);
  const elementX = useSharedValue(element.x);
  const elementY = useSharedValue(element.y);
  const elementScale = useSharedValue(element.scale);
  const elementRotation = useSharedValue(element.rotation);
  const gestureStartX = useSharedValue(element.x);
  const gestureStartY = useSharedValue(element.y);
  const gestureStartScale = useSharedValue(element.scale);
  const gestureStartRotation = useSharedValue(element.rotation);
  const isEditing =
    element.type === "widget" && element.id === editingWidgetElementId;
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(false);
  const [inputLineCount, setInputLineCount] = useState(
    getExplicitTextLineCount(element),
  );

  useEffect(() => {
    elementX.value = element.x;
    elementY.value = element.y;
    elementScale.value = element.scale;
    elementRotation.value = element.rotation;
  }, [
    element.rotation,
    element.scale,
    element.x,
    element.y,
    elementRotation,
    elementScale,
    elementX,
    elementY,
  ]);

  const handleGestureStart = useCallback(() => {
    onSelectElement(element.id);
  }, [element.id, onSelectElement]);
  const handleGestureEnd = useCallback(
    (x: number, y: number, scale: number, rotation: number) => {
      onChangeElement(
        toCommittedElement({
          ...element,
          rotation,
          scale,
          x,
          y,
        }),
      );
    },
    [element, onChangeElement],
  );

  /* eslint-disable react-hooks/immutability -- Reanimated shared values are updated inside gesture worklets. */
  const gesture = useMemo(() => {
    const panGesture = Gesture.Pan()
      .enabled(!isEditing)
      .minDistance(1)
      .onBegin(() => {
        gestureStartX.value = elementX.value;
        gestureStartY.value = elementY.value;
        runOnJS(handleGestureStart)();
      })
      .onUpdate((event) => {
        elementX.value = gestureStartX.value + event.translationX;
        elementY.value = gestureStartY.value + event.translationY;
      })
      .onEnd(() => {
        runOnJS(handleGestureEnd)(
          elementX.value,
          elementY.value,
          elementScale.value,
          elementRotation.value,
        );
      });
    const pinchGesture = Gesture.Pinch()
      .enabled(!isEditing)
      .onBegin(() => {
        gestureStartScale.value = elementScale.value;
        runOnJS(handleGestureStart)();
      })
      .onUpdate((event) => {
        elementScale.value = Math.max(
          MIN_ELEMENT_SCALE,
          Math.min(gestureStartScale.value * event.scale, MAX_ELEMENT_SCALE),
        );
      })
      .onEnd(() => {
        runOnJS(handleGestureEnd)(
          elementX.value,
          elementY.value,
          elementScale.value,
          elementRotation.value,
        );
      });
    const rotationGesture = Gesture.Rotation()
      .enabled(!isEditing)
      .onBegin(() => {
        gestureStartRotation.value = elementRotation.value;
        runOnJS(handleGestureStart)();
      })
      .onUpdate((event) => {
        elementRotation.value =
          gestureStartRotation.value + (event.rotation * 180) / Math.PI;
      })
      .onEnd(() => {
        runOnJS(handleGestureEnd)(
          elementX.value,
          elementY.value,
          elementScale.value,
          elementRotation.value,
        );
      });

    return Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture);
  }, [
    elementRotation,
    elementScale,
    elementX,
    elementY,
    gestureStartRotation,
    gestureStartScale,
    gestureStartX,
    gestureStartY,
    handleGestureEnd,
    handleGestureStart,
    isEditing,
  ]);
  /* eslint-enable react-hooks/immutability */

  const animatedPositionStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: elementX.value }, { translateY: elementY.value }],
  }));
  const animatedElementTransformStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: elementScale.value },
      { rotate: `${elementRotation.value}deg` },
    ],
  }));

  const handlePress = () => {
    const now = Date.now();
    const isDoubleTap = now - lastTapAtRef.current <= DOUBLE_TAP_DELAY_MS;

    lastTapAtRef.current = now;
    onSelectElement(element.id);

    if (
      isDoubleTap &&
      element.type === "widget" &&
      element.variant === "speechBubble"
    ) {
      onStartWidgetEditing(element.id);
    }
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.item,
        {
          zIndex: element.zIndex,
        },
        animatedPositionStyle,
      ]}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedElementTransformStyle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="스티커 선택"
            accessibilityState={{ selected: isSelected }}
            style={[styles.frame, isSelected && styles.selectedFrame]}
            onPressIn={() => {
              wasLongPressedRef.current = false;
              setIsDeleteButtonVisible(false);
            }}
            onLongPress={() => {
              wasLongPressedRef.current = true;
              onSelectElement(element.id);
              setIsDeleteButtonVisible(true);
            }}
            onPress={(event) => {
              event.stopPropagation();
              if (!wasLongPressedRef.current) {
                setIsDeleteButtonVisible(false);
              }
              wasLongPressedRef.current = false;
              handlePress();
            }}
          >
            <RecapCanvasStickerContent
              asset={asset}
              element={element}
              isEditing={isEditing}
              monthKey={monthKey}
              photo={photo}
              onChangeElement={onChangeElement}
              onEndWidgetEditing={onEndWidgetEditing}
              onSelectElement={onSelectElement}
              inputLineCount={inputLineCount}
              onChangeInputLineCount={setInputLineCount}
            />
          </Pressable>
        </Animated.View>
      </GestureDetector>
      {isSelected && isDeleteButtonVisible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="스티커 삭제"
          hitSlop={8}
          style={styles.deleteButton}
          onPress={() => onDeleteElement(element.id)}
        >
          <ReiconIcon color={appColors.white} name="Trash5" size={16} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

function RecapCanvasStickerContent(props: {
  asset: StickerAsset | null;
  element: RecapCanvasStickerElement | RecapCanvasWidgetElement;
  isEditing: boolean;
  monthKey: string;
  photo: DailyPhoto | null;
  onChangeElement: RecapCanvasStickerLayerProps["onChangeElement"];
  onEndWidgetEditing: () => void;
  onSelectElement: (elementId: string) => void;
  inputLineCount: number;
  onChangeInputLineCount: (lineCount: number) => void;
}) {
  const {
    asset,
    element,
    isEditing,
    monthKey,
    onChangeElement,
    onChangeInputLineCount,
    onEndWidgetEditing,
    onSelectElement,
    inputLineCount,
    photo,
  } = props;

  if (element.type === "sticker") {
    if (!asset || asset.source !== "sticker") {
      return null;
    }

    return (
      <Image
        cachePolicy="none"
        contentFit="contain"
        source={{ uri: asset.imagePath }}
        style={styles.userStickerImage}
      />
    );
  }

  if (element.variant === "calendar") {
    return <RecapCalendarWidget monthKey={monthKey} />;
  }

  if (element.variant === "speechBubble") {
    return (
      <RecapSpeechBubbleWidget
        element={element}
        isEditing={isEditing}
        onChangeElement={onChangeElement}
        onEndWidgetEditing={onEndWidgetEditing}
        inputLineCount={inputLineCount}
        onChangeInputLineCount={onChangeInputLineCount}
      />
    );
  }

  return (
    <RecapPolaroidWidget
      orientation={
        element.variant === "polaroidFramePortrait" ? "portrait" : "landscape"
      }
      photo={photo}
      onRequestPhotoSelection={() => onSelectElement(element.id)}
    />
  );
}

function RecapCalendarWidget(props: { monthKey: string }) {
  const monthDate = dayjs(`${props.monthKey}-01`);
  const calendar = buildCalendarMonth(monthDate.toDate());
  const weeks = toCalendarWeeks(calendar.days);

  return (
    <View style={styles.calendarWidget}>
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarMonthText}>{monthDate.format("MMMM")}</Text>
        <Text style={styles.calendarYearText}>{monthDate.format("YYYY")}</Text>
      </View>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((weekday, index) => (
          <Text key={`${weekday}-${index}`} style={styles.weekdayText}>
            {weekday}
          </Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View
            key={`week-${weekIndex}`}
            style={[
              styles.calendarWeek,
              weekIndex < weeks.length - 1 && styles.calendarWeekDivider,
            ]}
          >
            {week.map((cell, dayIndex) => (
              <View
                key={cell?.key ?? `empty-${weekIndex}-${dayIndex}`}
                style={styles.calendarDay}
              >
                {cell ? (
                  <Text style={styles.calendarDayText}>{cell.dayOfMonth}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function RecapSpeechBubbleWidget(props: {
  element: RecapCanvasWidgetElement & { variant: "speechBubble" };
  isEditing: boolean;
  onChangeElement: RecapCanvasStickerLayerProps["onChangeElement"];
  onEndWidgetEditing: () => void;
  inputLineCount: number;
  onChangeInputLineCount: (lineCount: number) => void;
}) {
  const {
    element,
    inputLineCount,
    isEditing,
    onChangeElement,
    onChangeInputLineCount,
    onEndWidgetEditing,
  } = props;
  const textStyle = styles.speechBubbleText as StyleProp<TextStyle>;

  if (!isEditing) {
    return (
      <MessageRecapBubble
        text={element.text}
        style={styles.speechBubble}
        lineCount={inputLineCount}
        textStyle={textStyle}
      />
    );
  }

  return (
    <MessageRecapBubble
      lineCount={inputLineCount}
      text={element.text}
      style={styles.speechBubble}
    >
      <TextInput
        autoFocus
        multiline
        scrollEnabled={false}
        style={styles.speechBubbleInput}
        value={element.text}
        onBlur={onEndWidgetEditing}
        onChangeText={(text) => {
          onChangeInputLineCount(getExplicitTextLineCount(text));
          onChangeElement({
            ...element,
            text,
          });
        }}
        onContentSizeChange={(event) => {
          onChangeInputLineCount(
            Math.max(
              getExplicitTextLineCount(element.text),
              Math.ceil(event.nativeEvent.contentSize.height / 22),
            ),
          );
        }}
      />
    </MessageRecapBubble>
  );
}

function RecapPolaroidWidget(props: {
  onRequestPhotoSelection: () => void;
  orientation: "landscape" | "portrait";
  photo: DailyPhoto | null;
}) {
  const { onRequestPhotoSelection, orientation, photo } = props;

  if (photo) {
    return (
      <PolaroidPhotoFrame
        imagePath={photo.imagePath}
        orientation={orientation}
        style={[
          styles.polaroid,
          orientation === "portrait" && styles.polaroidPortrait,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.emptyPolaroid,
        orientation === "portrait" && styles.emptyPolaroidPortrait,
      ]}
    >
      <Pressable
        accessibilityLabel="폴라로이드 사진 선택"
        accessibilityRole="button"
        style={styles.emptyPolaroidPhoto}
        onPress={onRequestPhotoSelection}
      >
        <ReiconIcon
          color={appColors.blackOverlay34}
          name="GalleryAdd"
          size={28}
        />
      </Pressable>
    </View>
  );
}

function getExplicitTextLineCount(
  element: RecapCanvasElement | string,
): number {
  if (typeof element === "string") {
    return Math.max(element.split("\n").length, 1);
  }

  if (element.type !== "widget" || element.variant !== "speechBubble") {
    return 1;
  }

  return Math.max(element.text.split("\n").length, 1);
}

function toCommittedElement<
  Element extends RecapCanvasStickerElement | RecapCanvasWidgetElement,
>(element: Element): Element {
  return {
    ...element,
    rotation: roundElementNumber(element.rotation),
    scale: roundElementNumber(element.scale),
    x: Math.round(element.x),
    y: Math.round(element.y),
  };
}

function roundElementNumber(value: number): number {
  return Math.round(value * 1000) / 1000;
}

const styles = StyleSheet.create({
  calendarDay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 64,
  },
  calendarDayText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
    transform: [{ translateY: -8 }],
  },
  calendarGrid: {
    width: "100%",
  },
  calendarHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  calendarMonthText: {
    color: appColors.black,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  calendarWeek: {
    flexDirection: "row",
    minHeight: 64,
  },
  calendarWeekDivider: {
    borderBottomColor: "#D1D1D1",
    borderBottomWidth: 1,
  },
  calendarWidget: {
    backgroundColor: appColors.white,
    borderCurve: "continuous",
    borderRadius: 12,
    boxShadow: "none",
    justifyContent: "flex-start",
    paddingBottom: 0,
    paddingHorizontal: 18,
    paddingTop: 10,
    width: 240,
  },
  calendarYearText: {
    color: appColors.blackOverlay34,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 20,
  },
  deleteButton: {
    alignItems: "center",
    backgroundColor: "#D92D20",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: -14,
    top: -14,
    width: 32,
  },
  emptyPolaroid: {
    backgroundColor: "#fffdfa",
    boxShadow: "none",
    elevation: 0,
    height: 118,
    paddingBottom: 16,
    paddingHorizontal: 7,
    paddingTop: 7,
    shadowOpacity: 0,
    width: 164,
  },
  emptyPolaroidPhoto: {
    alignItems: "center",
    backgroundColor: "#e9e9e4",
    flex: 1,
    justifyContent: "center",
  },
  frame: {
    borderColor: "transparent",
    borderWidth: 2,
    minHeight: 32,
    minWidth: 32,
  },
  item: {
    left: 0,
    position: "absolute",
    top: 0,
  },
  layer: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: appLayers.canvasElement + 1,
  },
  polaroid: {
    boxShadow: "none",
    elevation: 0,
    height: 118,
    position: "relative",
    shadowOpacity: 0,
    width: 164,
  },
  polaroidPortrait: {
    height: 164,
    width: 118,
  },
  emptyPolaroidPortrait: {
    height: 164,
    width: 118,
  },
  selectedFrame: {
    borderColor: "#2F80FF",
    borderWidth: 2,
  },
  speechBubble: {
    alignSelf: "flex-start",
    maxWidth: 280,
    minHeight: 46,
    minWidth: 72,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  speechBubbleInput: {
    color: appColors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 22,
    minWidth: 80,
    padding: 0,
  },
  speechBubbleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userStickerImage: {
    height: DEFAULT_ITEM_SIZE,
    width: DEFAULT_ITEM_SIZE,
  },
  weekdayRow: {
    borderBottomColor: "#D1D1D1",
    borderBottomWidth: 1,
    flexDirection: "row",
    marginBottom: 0,
    paddingBottom: 6,
  },
  weekdayText: {
    color: appColors.blackOverlay34,
    flex: 1,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 16,
    textAlign: "center",
  },
});
