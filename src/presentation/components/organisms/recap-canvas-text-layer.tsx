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
const DOUBLE_TAP_DELAY_MS = 280;

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
  const gestureStartX = useSharedValue(element.x);
  const gestureStartY = useSharedValue(element.y);
  const gestureStartScale = useSharedValue(element.scale);
  const gestureStartRotation = useSharedValue(element.rotation);

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
      onChangeTextElement(
        toCommittedTextElement({
          ...element,
          rotation,
          scale,
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
          MIN_TEXT_SCALE,
          Math.min(gestureStartScale.value * event.scale, MAX_TEXT_SCALE),
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
  const animatedTextTransformStyle = useAnimatedStyle(() => ({
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
        <Animated.View style={animatedTextTransformStyle}>
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
                <TextHandle />
                <TextHandle position="right" />
              </>
            ) : null}
            {isEditing ? (
              <TextInput
                autoFocus
                multiline
                scrollEnabled={false}
                style={[styles.text, toTextStyle(element)]}
                value={element.content}
                onBlur={onEndTextEditing}
                onChangeText={handleChangeText}
                onSubmitEditing={handleSubmitEditing}
              />
            ) : (
              <Text style={[styles.text, toTextStyle(element)]}>
                {element.content}
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

function TextHandle(props: { position?: "left" | "right" }) {
  const { position = "left" } = props;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.textHandle,
        position === "left" ? styles.leftHandle : styles.rightHandle,
      ]}
    />
  );
}

function toTextStyle(element: RecapCanvasTextElement): TextStyle {
  return {
    color: element.color,
    fontFamily: element.fontFamily,
    fontSize: element.fontSize,
    fontStyle: element.fontStyle,
    fontWeight: element.fontWeight,
    textAlign: element.textAlign,
    textDecorationLine: element.textDecorationLine,
  };
}

function toCommittedTextElement(
  element: RecapCanvasTextElement,
): RecapCanvasTextElement {
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
  },
  textFrame: {
    borderColor: "transparent",
    borderWidth: 2,
    maxWidth: 360,
    minHeight: 42,
    minWidth: 64,
    position: "relative",
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
});
