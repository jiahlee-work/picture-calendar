import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type NativeSyntheticEvent,
  type TextStyle,
  type TextInputSubmitEditingEventData,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { sortRecapCanvasElements } from "@/application/services/recap/recap-canvas-elements";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";
import type {
  RecapCanvasElement,
  RecapCanvasTextElement,
} from "@/shared/recap/types";

type RecapCanvasTextLayerProps = {
  editingElementId: string | null;
  elements: RecapCanvasElement[];
  selectedElementId: string | null;
  onChangeTextElement: (element: RecapCanvasTextElement) => void;
  onEndTextEditing: () => void;
  onSelectElement: (elementId: string | null) => void;
  onStartTextEditing: (elementId: string) => void;
};

type RecapCanvasTextItemProps = {
  element: RecapCanvasTextElement;
  isEditing: boolean;
  isSelected: boolean;
  onChangeTextElement: (element: RecapCanvasTextElement) => void;
  onEndTextEditing: () => void;
  onSelectElement: (elementId: string) => void;
  onStartTextEditing: (elementId: string) => void;
};

const MIN_TEXT_SCALE = 0.35;
const MAX_TEXT_SCALE = 4;
const MIN_TEXT_FONT_SIZE = 8;
const MAX_TEXT_FONT_SIZE = 180;
const MIN_TEXT_BOX_WIDTH = 72;
const MAX_TEXT_BOX_WIDTH = 720;
const DEFAULT_TEXT_BOX_WIDTH = 340;
const DOUBLE_TAP_DELAY_MS = 280;
const ITALIC_SKEW_X = "-10deg";

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export function RecapCanvasTextLayer(props: RecapCanvasTextLayerProps) {
  const {
    editingElementId,
    elements,
    onChangeTextElement,
    onEndTextEditing,
    onSelectElement,
    onStartTextEditing,
    selectedElementId,
  } = props;
  const textElements = sortRecapCanvasElements(elements).filter(
    (element): element is RecapCanvasTextElement => element.type === "text",
  );

  return (
    <Pressable
      accessibilityRole="none"
      style={styles.layer}
      onPress={() => onSelectElement(null)}
    >
      {textElements.map((element) => (
        <RecapCanvasTextItem
          key={element.id}
          element={element}
          isEditing={element.id === editingElementId}
          isSelected={element.id === selectedElementId}
          onChangeTextElement={onChangeTextElement}
          onEndTextEditing={onEndTextEditing}
          onSelectElement={onSelectElement}
          onStartTextEditing={onStartTextEditing}
        />
      ))}
    </Pressable>
  );
}

function RecapCanvasTextItem(props: RecapCanvasTextItemProps) {
  const {
    element,
    isEditing,
    isSelected,
    onChangeTextElement,
    onEndTextEditing,
    onSelectElement,
    onStartTextEditing,
  } = props;
  const lastTapAtRef = useRef(0);
  const elementX = useSharedValue(element.x);
  const elementY = useSharedValue(element.y);
  const elementScale = useSharedValue(element.scale);
  const elementRotation = useSharedValue(element.rotation);
  const elementWidth = useSharedValue(element.width ?? DEFAULT_TEXT_BOX_WIDTH);
  const gestureStartX = useSharedValue(element.x);
  const gestureStartY = useSharedValue(element.y);
  const gestureStartScale = useSharedValue(element.scale);
  const gestureStartRotation = useSharedValue(element.rotation);
  const gestureStartWidth = useSharedValue(
    element.width ?? DEFAULT_TEXT_BOX_WIDTH,
  );

  useEffect(() => {
    elementX.value = element.x;
    elementY.value = element.y;
    elementScale.value = element.scale;
    elementRotation.value = element.rotation;
    elementWidth.value = element.width ?? DEFAULT_TEXT_BOX_WIDTH;
  }, [
    element.rotation,
    element.scale,
    element.width,
    element.x,
    element.y,
    elementRotation,
    elementScale,
    elementWidth,
    elementX,
    elementY,
  ]);

  const handleGestureStart = useCallback(() => {
    onSelectElement(element.id);
  }, [element.id, onSelectElement]);
  const handleGestureEnd = useCallback(
    (x: number, y: number, scale: number, rotation: number, width: number) => {
      const nextFontSize = clampTextFontSize(
        Math.round(element.fontSize * scale),
      );
      const nextWidth = clampTextBoxWidth(width);

      onChangeTextElement(
        toCommittedTextElement({
          ...element,
          fontSize: nextFontSize,
          rotation,
          scale: 1,
          width: nextWidth,
          x,
          y,
        }),
      );
    },
    [element, onChangeTextElement],
  );
  const handleResizeEnd = useCallback(
    (x: number, y: number, width: number) => {
      onChangeTextElement(
        toCommittedTextElement({
          ...element,
          scale: 1,
          width: clampTextBoxWidth(width),
          x,
          y,
        }),
      );
    },
    [element, onChangeTextElement],
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
          elementWidth.value,
        );
      });
    const pinchGesture = Gesture.Pinch()
      .enabled(!isEditing)
      .onBegin(() => {
        gestureStartScale.value = elementScale.value;
        gestureStartWidth.value = elementWidth.value;
        runOnJS(handleGestureStart)();
      })
      .onUpdate((event) => {
        const nextScale = gestureStartScale.value * event.scale;
        const minScale = MIN_TEXT_FONT_SIZE / element.fontSize;
        const maxScale = MAX_TEXT_FONT_SIZE / element.fontSize;

        elementScale.value = Math.max(
          Math.max(MIN_TEXT_SCALE, minScale),
          Math.min(nextScale, Math.min(MAX_TEXT_SCALE, maxScale)),
        );
        elementWidth.value = clampTextBoxWidth(
          gestureStartWidth.value * elementScale.value,
        );
      })
      .onEnd(() => {
        runOnJS(handleGestureEnd)(
          elementX.value,
          elementY.value,
          elementScale.value,
          elementRotation.value,
          elementWidth.value,
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
          elementWidth.value,
        );
      });

    return Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture);
  }, [
    elementRotation,
    elementScale,
    element.fontSize,
    elementWidth,
    elementX,
    elementY,
    gestureStartRotation,
    gestureStartScale,
    gestureStartWidth,
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
  const animatedTextTransformStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${elementRotation.value}deg` }],
  }));
  const animatedTextFrameStyle = useAnimatedStyle(() => ({
    width: elementWidth.value,
  }));
  const animatedTextSizeStyle = useAnimatedStyle(() => {
    const nextFontSize = Math.max(
      MIN_TEXT_FONT_SIZE,
      Math.min(
        Math.round(element.fontSize * elementScale.value),
        MAX_TEXT_FONT_SIZE,
      ),
    );

    return {
      fontSize: nextFontSize,
      lineHeight: Math.round(nextFontSize * 1.2),
    };
  });

  /* eslint-disable react-hooks/immutability -- Reanimated shared values are updated inside gesture worklets. */
  const leftResizeGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!isEditing)
        .minDistance(1)
        .onBegin(() => {
          gestureStartX.value = elementX.value;
          gestureStartY.value = elementY.value;
          gestureStartWidth.value = elementWidth.value;
          runOnJS(handleGestureStart)();
        })
        .onUpdate((event) => {
          const rotationRadians = (elementRotation.value * Math.PI) / 180;
          const localDeltaX =
            event.translationX * Math.cos(rotationRadians) +
            event.translationY * Math.sin(rotationRadians);
          const nextWidth = clampTextBoxWidth(
            gestureStartWidth.value - localDeltaX,
          );
          const effectiveDeltaX = gestureStartWidth.value - nextWidth;

          elementWidth.value = nextWidth;
          elementX.value =
            gestureStartX.value + effectiveDeltaX * Math.cos(rotationRadians);
          elementY.value =
            gestureStartY.value + effectiveDeltaX * Math.sin(rotationRadians);
        })
        .onEnd(() => {
          runOnJS(handleResizeEnd)(
            elementX.value,
            elementY.value,
            elementWidth.value,
          );
        }),
    [
      elementRotation,
      elementWidth,
      elementX,
      elementY,
      gestureStartWidth,
      gestureStartX,
      gestureStartY,
      handleGestureStart,
      handleResizeEnd,
      isEditing,
    ],
  );
  const rightResizeGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!isEditing)
        .minDistance(1)
        .onBegin(() => {
          gestureStartWidth.value = elementWidth.value;
          runOnJS(handleGestureStart)();
        })
        .onUpdate((event) => {
          const rotationRadians = (elementRotation.value * Math.PI) / 180;
          const localDeltaX =
            event.translationX * Math.cos(rotationRadians) +
            event.translationY * Math.sin(rotationRadians);

          elementWidth.value = clampTextBoxWidth(
            gestureStartWidth.value + localDeltaX,
          );
        })
        .onEnd(() => {
          runOnJS(handleResizeEnd)(
            elementX.value,
            elementY.value,
            elementWidth.value,
          );
        }),
    [
      elementRotation,
      elementWidth,
      elementX,
      elementY,
      gestureStartWidth,
      handleGestureStart,
      handleResizeEnd,
      isEditing,
    ],
  );
  const scaleHandleGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!isEditing)
        .minDistance(1)
        .onBegin(() => {
          gestureStartScale.value = 1;
          gestureStartWidth.value = elementWidth.value;
          runOnJS(handleGestureStart)();
        })
        .onUpdate((event) => {
          const rotationRadians = (elementRotation.value * Math.PI) / 180;
          const localDeltaX =
            event.translationX * Math.cos(rotationRadians) +
            event.translationY * Math.sin(rotationRadians);
          const nextScale = Math.max(
            MIN_TEXT_SCALE,
            Math.min(
              1 + localDeltaX / gestureStartWidth.value,
              Math.min(MAX_TEXT_SCALE, MAX_TEXT_FONT_SIZE / element.fontSize),
            ),
          );

          elementScale.value = nextScale;
          elementWidth.value = clampTextBoxWidth(
            gestureStartWidth.value * nextScale,
          );
        })
        .onEnd(() => {
          runOnJS(handleGestureEnd)(
            elementX.value,
            elementY.value,
            elementScale.value,
            elementRotation.value,
            elementWidth.value,
          );
        }),
    [
      element.fontSize,
      elementRotation,
      elementScale,
      elementWidth,
      elementX,
      elementY,
      gestureStartScale,
      gestureStartWidth,
      handleGestureEnd,
      handleGestureStart,
      isEditing,
    ],
  );
  /* eslint-enable react-hooks/immutability */

  const handlePress = () => {
    const now = Date.now();
    const isDoubleTap = now - lastTapAtRef.current <= DOUBLE_TAP_DELAY_MS;

    lastTapAtRef.current = now;
    onSelectElement(element.id);

    if (isDoubleTap) {
      onStartTextEditing(element.id);
    }
  };
  const handleChangeText = (content: string) => {
    onChangeTextElement({
      ...element,
      content,
    });
  };
  const handleSubmitEditing = (
    event: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
  ) => {
    event.preventDefault();
    onEndTextEditing();
  };

  return (
    <Animated.View
      style={[
        styles.item,
        {
          zIndex: element.zIndex,
        },
        animatedPositionStyle,
      ]}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[animatedTextTransformStyle, animatedTextFrameStyle]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="텍스트 선택"
            accessibilityState={{ selected: isSelected }}
            style={[styles.textFrame, isSelected && styles.selectedTextFrame]}
            onPress={(event) => {
              event.stopPropagation();
              handlePress();
            }}
          >
            {isSelected ? (
              <>
                <GestureDetector gesture={leftResizeGesture}>
                  <Animated.View
                    accessibilityLabel="텍스트 박스 왼쪽 너비 조절"
                    style={[styles.textHandle, styles.leftHandle]}
                  />
                </GestureDetector>
                <GestureDetector gesture={rightResizeGesture}>
                  <Animated.View
                    accessibilityLabel="텍스트 박스 오른쪽 너비 조절"
                    style={[styles.textHandle, styles.rightHandle]}
                  />
                </GestureDetector>
                <GestureDetector gesture={scaleHandleGesture}>
                  <Animated.View
                    accessibilityLabel="텍스트 박스 비율 확대 축소"
                    style={styles.scaleHandle}
                  />
                </GestureDetector>
              </>
            ) : null}
            {isEditing ? (
              <AnimatedTextInput
                autoFocus
                multiline
                scrollEnabled={false}
                style={[
                  styles.text,
                  toTextStyle(element),
                  animatedTextSizeStyle,
                  toItalicTextStyle(element),
                ]}
                value={element.content}
                onBlur={onEndTextEditing}
                onChangeText={handleChangeText}
                onSubmitEditing={handleSubmitEditing}
              />
            ) : (
              <AnimatedText
                style={[
                  styles.text,
                  toTextStyle(element),
                  animatedTextSizeStyle,
                  toItalicTextStyle(element),
                ]}
              >
                {element.content}
              </AnimatedText>
            )}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

function toTextStyle(element: RecapCanvasTextElement): TextStyle {
  return {
    color: element.color,
    fontFamily: element.fontFamily,
    fontSize: element.fontSize,
    fontStyle: element.fontStyle === "italic" ? "normal" : element.fontStyle,
    fontWeight: element.fontWeight,
    lineHeight: Math.round(element.fontSize * 1.2),
    textAlign: element.textAlign,
    textDecorationLine: element.textDecorationLine,
  };
}

function toItalicTextStyle(element: RecapCanvasTextElement): TextStyle {
  if (element.fontStyle !== "italic") {
    return {};
  }

  return {
    transform: [{ skewX: ITALIC_SKEW_X }],
  };
}

function clampTextFontSize(fontSize: number): number {
  return Math.max(MIN_TEXT_FONT_SIZE, Math.min(fontSize, MAX_TEXT_FONT_SIZE));
}

function clampTextBoxWidth(width: number): number {
  "worklet";

  return Math.max(MIN_TEXT_BOX_WIDTH, Math.min(width, MAX_TEXT_BOX_WIDTH));
}

function toCommittedTextElement(
  element: RecapCanvasTextElement,
): RecapCanvasTextElement {
  return {
    ...element,
    rotation: roundElementNumber(element.rotation),
    scale: roundElementNumber(element.scale),
    width: Math.round(element.width ?? DEFAULT_TEXT_BOX_WIDTH),
    x: Math.round(element.x),
    y: Math.round(element.y),
  };
}

function roundElementNumber(value: number): number {
  return Math.round(value * 1000) / 1000;
}

const styles = StyleSheet.create({
  layer: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: appLayers.canvasElement,
  },
  item: {
    left: 0,
    position: "absolute",
    top: 0,
  },
  leftHandle: {
    left: -10,
  },
  rightHandle: {
    right: -10,
  },
  selectedTextFrame: {
    borderColor: "#2F80FF",
    borderWidth: 2,
  },
  text: {
    color: appColors.black,
    fontSize: 24,
    fontWeight: "normal",
    lineHeight: 32,
    minWidth: 56,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: "100%",
  },
  textFrame: {
    borderColor: "transparent",
    borderWidth: 2,
    minHeight: 42,
    minWidth: 64,
    position: "relative",
    width: "100%",
  },
  textHandle: {
    backgroundColor: "#36A9E1",
    borderRadius: 10,
    height: 20,
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -10 }],
    width: 20,
    zIndex: 1,
  },
  scaleHandle: {
    backgroundColor: "#00E52A",
    borderRadius: 8,
    bottom: -9,
    height: 16,
    position: "absolute",
    right: -9,
    width: 16,
    zIndex: 2,
  },
});
