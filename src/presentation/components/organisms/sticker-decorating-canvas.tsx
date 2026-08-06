import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import type {
  StickerAsset,
  StickerPlacement,
} from "@/application/services/stickers/types";
import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import { StickerAssetPreview } from "@/presentation/components/organisms/sticker-asset-preview";
import {
  moveStickerPlacementZIndex,
  sortStickerPlacements,
} from "@/presentation/helpers/stickers/sticker-placement-order";
import { appColors } from "@/presentation/theme/colors";

type StickerDecoratingCanvasProps = {
  assets: StickerAsset[];
  editable?: boolean;
  placementSize?: number;
  placements: StickerPlacement[];
  selectedPlacementId: string | null;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  onChangePlacement: (placement: StickerPlacement) => void;
  onChangePlacements: (placements: StickerPlacement[]) => void;
  onDeletePlacement?: (placementId: string) => void;
  onSelectPlacement: (placementId: string | null) => void;
};

type StickerPlacementItemProps = {
  asset: StickerAsset;
  editable: boolean;
  isSelected: boolean;
  placement: StickerPlacement;
  placementSize: number;
  onChangePlacement: (placement: StickerPlacement) => void;
  onDeletePlacement?: (placementId: string) => void;
  onMoveBackward: (placementId: string) => void;
  onMoveForward: (placementId: string) => void;
  onSelectPlacement: (placementId: string) => void;
};

const DEFAULT_PLACEMENT_SIZE = 132;
const MIN_PLACEMENT_SCALE = 0.2;
const MAX_PLACEMENT_SCALE = 4;

export function StickerDecoratingCanvas(props: StickerDecoratingCanvasProps) {
  const {
    assets,
    children,
    editable = true,
    onChangePlacement,
    onChangePlacements,
    onDeletePlacement,
    onSelectPlacement,
    placementSize = DEFAULT_PLACEMENT_SIZE,
    placements,
    selectedPlacementId,
    style,
  } = props;
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  const orderedPlacements = sortStickerPlacements(placements);

  const handleMovePlacement = (
    placementId: string,
    direction: "backward" | "forward",
  ) => {
    onChangePlacements(
      moveStickerPlacementZIndex(placements, placementId, direction),
    );
  };

  return (
    <Pressable
      accessibilityRole="none"
      style={[styles.root, style]}
      onPress={editable ? () => onSelectPlacement(null) : undefined}
    >
      {children}
      {orderedPlacements.map((placement) => {
        const asset = assetsById.get(placement.assetId);

        if (!asset) {
          return null;
        }

        return (
          <StickerPlacementItem
            key={placement.id}
            asset={asset}
            editable={editable}
            isSelected={placement.id === selectedPlacementId}
            placement={placement}
            placementSize={placementSize}
            onChangePlacement={onChangePlacement}
            onDeletePlacement={onDeletePlacement}
            onMoveBackward={(placementId) =>
              handleMovePlacement(placementId, "backward")
            }
            onMoveForward={(placementId) =>
              handleMovePlacement(placementId, "forward")
            }
            onSelectPlacement={onSelectPlacement}
          />
        );
      })}
    </Pressable>
  );
}

function StickerPlacementItem(props: StickerPlacementItemProps) {
  const {
    asset,
    editable,
    isSelected,
    onChangePlacement,
    onDeletePlacement,
    onMoveBackward,
    onMoveForward,
    onSelectPlacement,
    placement,
    placementSize,
  } = props;
  const [showsDeleteControl, setShowsDeleteControl] = useState(false);
  const placementX = useSharedValue(placement.x);
  const placementY = useSharedValue(placement.y);
  const placementScale = useSharedValue(placement.scale);
  const placementRotation = useSharedValue(placement.rotation);
  const gestureStartX = useSharedValue(placement.x);
  const gestureStartY = useSharedValue(placement.y);
  const gestureStartScale = useSharedValue(placement.scale);
  const gestureStartRotation = useSharedValue(placement.rotation);

  useEffect(() => {
    placementX.value = placement.x;
    placementY.value = placement.y;
    placementScale.value = placement.scale;
    placementRotation.value = placement.rotation;
  }, [
    placement.rotation,
    placement.scale,
    placement.x,
    placement.y,
    placementRotation,
    placementScale,
    placementX,
    placementY,
  ]);

  const handleGestureStart = useCallback(() => {
    onSelectPlacement(placement.id);
    setShowsDeleteControl(false);
  }, [onSelectPlacement, placement.id]);
  const handleGestureEnd = useCallback(
    (x: number, y: number, scale: number, rotation: number) => {
      onChangePlacement(
        toCommittedPlacement({
          ...placement,
          rotation,
          scale,
          x,
          y,
        }),
      );
    },
    [onChangePlacement, placement],
  );

  /* eslint-disable react-hooks/immutability -- Reanimated shared values are updated inside gesture worklets. */
  const gesture = useMemo(() => {
    const panGesture = Gesture.Pan()
      .enabled(editable)
      .minDistance(1)
      .onBegin(() => {
        gestureStartX.value = placementX.value;
        gestureStartY.value = placementY.value;
        runOnJS(handleGestureStart)();
      })
      .onUpdate((event) => {
        placementX.value = gestureStartX.value + event.translationX;
        placementY.value = gestureStartY.value + event.translationY;
      })
      .onEnd(() => {
        runOnJS(handleGestureEnd)(
          placementX.value,
          placementY.value,
          placementScale.value,
          placementRotation.value,
        );
      });
    const pinchGesture = Gesture.Pinch()
      .enabled(editable)
      .onBegin(() => {
        gestureStartScale.value = placementScale.value;
        runOnJS(handleGestureStart)();
      })
      .onUpdate((event) => {
        placementScale.value = Math.max(
          MIN_PLACEMENT_SCALE,
          Math.min(gestureStartScale.value * event.scale, MAX_PLACEMENT_SCALE),
        );
      })
      .onEnd(() => {
        runOnJS(handleGestureEnd)(
          placementX.value,
          placementY.value,
          placementScale.value,
          placementRotation.value,
        );
      });
    const rotationGesture = Gesture.Rotation()
      .enabled(editable)
      .onBegin(() => {
        gestureStartRotation.value = placementRotation.value;
        runOnJS(handleGestureStart)();
      })
      .onUpdate((event) => {
        placementRotation.value =
          gestureStartRotation.value + (event.rotation * 180) / Math.PI;
      })
      .onEnd(() => {
        runOnJS(handleGestureEnd)(
          placementX.value,
          placementY.value,
          placementScale.value,
          placementRotation.value,
        );
      });

    return Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture);
  }, [
    editable,
    gestureStartRotation,
    gestureStartScale,
    gestureStartX,
    gestureStartY,
    handleGestureEnd,
    handleGestureStart,
    placementRotation,
    placementScale,
    placementX,
    placementY,
  ]);
  /* eslint-enable react-hooks/immutability */
  const animatedPlacementPositionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: placementX.value },
      { translateY: placementY.value },
    ],
  }));
  const animatedStickerTransformStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: placementScale.value },
      { rotate: `${placementRotation.value}deg` },
    ],
  }));
  const animatedLayerControlsPositionStyle = useAnimatedStyle(() => {
    const halfSize = placementSize / 2;
    const scaledCornerX = halfSize * placementScale.value;
    const scaledCornerY = -halfSize * placementScale.value;
    const rotationRadians = (placementRotation.value * Math.PI) / 180;
    const rotatedCornerX =
      scaledCornerX * Math.cos(rotationRadians) -
      scaledCornerY * Math.sin(rotationRadians);
    const rotatedCornerY =
      scaledCornerX * Math.sin(rotationRadians) +
      scaledCornerY * Math.cos(rotationRadians);

    return {
      transform: [
        { translateX: rotatedCornerX - halfSize },
        { translateY: rotatedCornerY + halfSize },
      ],
    };
  });
  const animatedLayerControlsRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${placementRotation.value}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents={editable ? "auto" : "none"}
      style={[
        styles.placement,
        {
          height: placementSize,
          width: placementSize,
          zIndex: placement.zIndex,
        },
        animatedPlacementPositionStyle,
      ]}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.gestureTarget, animatedStickerTransformStyle]}
        >
          <Pressable
            delayLongPress={320}
            style={styles.placementContent}
            onLongPress={(event) => {
              if (!editable) {
                return;
              }

              event.stopPropagation();
              onSelectPlacement(placement.id);
              setShowsDeleteControl(true);
            }}
            onPress={(event) => {
              if (!editable) {
                return;
              }

              event.stopPropagation();
              onSelectPlacement(placement.id);
              setShowsDeleteControl(false);
            }}
          >
            <StickerAssetPreview asset={asset} />
          </Pressable>
        </Animated.View>
      </GestureDetector>
      {isSelected && editable && showsDeleteControl && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.layerControlsAnchor,
            animatedLayerControlsPositionStyle,
          ]}
        >
          <Animated.View style={animatedLayerControlsRotationStyle}>
            <StickerPlacementLayerControls
              onDelete={
                onDeletePlacement
                  ? () => {
                      onDeletePlacement(placement.id);
                    }
                  : undefined
              }
              onMoveBackward={() => onMoveBackward(placement.id)}
              onMoveForward={() => onMoveForward(placement.id)}
            />
          </Animated.View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function StickerPlacementLayerControls(props: {
  onDelete?: () => void;
  onMoveBackward: () => void;
  onMoveForward: () => void;
}) {
  const { onDelete, onMoveBackward, onMoveForward } = props;

  return (
    <View style={styles.layerControls}>
      {onDelete && (
        <StickerPlacementLayerButton
          accessibilityLabel="스티커 삭제"
          icon="Trash5"
          variant="destructive"
          onPress={onDelete}
        />
      )}
      <StickerPlacementLayerButton
        accessibilityLabel="스티커를 뒤로 보내기"
        icon="ChevronDown"
        onPress={onMoveBackward}
      />
      <StickerPlacementLayerButton
        accessibilityLabel="스티커를 앞으로 가져오기"
        icon="ChevronUp"
        onPress={onMoveForward}
      />
    </View>
  );
}

function StickerPlacementLayerButton(props: {
  accessibilityLabel: string;
  icon: "ChevronDown" | "ChevronUp" | "Trash5";
  variant?: "default" | "destructive";
  onPress: () => void;
}) {
  const { accessibilityLabel, icon, onPress, variant = "default" } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.layerControlButton,
        variant === "destructive" && styles.destructiveLayerControlButton,
        pressed && styles.layerControlButtonPressed,
      ]}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
    >
      <ReiconIcon color={appColors.white} name={icon} size={18} />
    </Pressable>
  );
}

function toCommittedPlacement(placement: StickerPlacement): StickerPlacement {
  return {
    ...placement,
    rotation: roundPlacementNumber(placement.rotation),
    scale: roundPlacementNumber(placement.scale),
    x: Math.round(placement.x),
    y: Math.round(placement.y),
  };
}

function roundPlacementNumber(value: number): number {
  return Math.round(value * 1000) / 1000;
}

const styles = StyleSheet.create({
  gestureTarget: {
    height: "100%",
    width: "100%",
  },
  layerControlButton: {
    alignItems: "center",
    backgroundColor: appColors.black,
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  layerControlButtonPressed: {
    opacity: 0.72,
  },
  destructiveLayerControlButton: {
    backgroundColor: "#D92D20",
  },
  layerControlsAnchor: {
    position: "absolute",
    right: -8,
    top: -44,
    zIndex: 1,
  },
  layerControls: {
    flexDirection: "row",
    gap: 8,
  },
  placement: {
    position: "absolute",
  },
  placementContent: {
    height: "100%",
    overflow: "visible",
    width: "100%",
  },
  root: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
});
