import { Image } from "expo-image";
import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import type { DailyPhoto } from "@/application/services/daily-photo/types";
import type {
  RecapCanvasLayoutDefinition,
  RecapCanvasLayoutLine,
  RecapCanvasLayoutSlot,
  RecapCanvasLayoutSlotPhotoMap,
} from "@/application/services/recap/recap-canvas-layout";
import { appColors } from "@/presentation/theme/colors";

const LAYOUT_GUIDE_LINE_COLOR = "#D0D0D0";
const LAYOUT_GUIDE_LINE_WIDTH = 1;

type RecapLayoutCanvasProps = {
  children?: ReactNode;
  isEditing: boolean;
  layout: RecapCanvasLayoutDefinition | null;
  onSelectSlot: (slotId: string) => void;
  photosById: Record<string, DailyPhoto>;
  selectedSlotId: string | null;
  slotPhotoIds: RecapCanvasLayoutSlotPhotoMap;
};

export function RecapLayoutCanvas(props: RecapLayoutCanvasProps) {
  const {
    children,
    isEditing,
    layout,
    onSelectSlot,
    photosById,
    selectedSlotId,
    slotPhotoIds,
  } = props;

  if (!layout) {
    return <View style={styles.canvas}>{children}</View>;
  }

  return (
    <View style={styles.canvas}>
      {layout.slots.map((slot, index) => {
        const photoId = slotPhotoIds[slot.id];
        const photo = photoId ? photosById[photoId] : undefined;
        const isSelected = slot.id === selectedSlotId;

        return (
          <Pressable
            key={slot.id}
            accessibilityRole="button"
            accessibilityLabel="레이아웃 사진 칸 선택"
            accessibilityState={{ selected: isSelected }}
            style={[styles.slot, toSlotStyle(slot)]}
            onPress={() => onSelectSlot(slot.id)}
          >
            {photo ? (
              <Image
                cachePolicy="none"
                contentFit="cover"
                source={{ uri: photo.imagePath }}
                style={styles.photo}
              />
            ) : (
              <View style={styles.emptySlot} />
            )}
            {isEditing ? (
              <View
                style={[
                  styles.slotBadge,
                  isSelected && styles.selectedSlotBadge,
                ]}
              >
                <Text
                  style={[
                    styles.slotBadgeText,
                    isSelected && styles.selectedSlotBadgeText,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
      {isEditing
        ? layout.lines.map((line) => (
            <View
              key={line.id}
              pointerEvents="none"
              style={toLineStyle(line)}
            />
          ))
        : null}
    </View>
  );
}

function toSlotStyle(slot: RecapCanvasLayoutSlot): ViewStyle {
  return {
    height: `${slot.height * 100}%`,
    left: `${slot.x * 100}%`,
    top: `${slot.y * 100}%`,
    width: `${slot.width * 100}%`,
  };
}

function toLineStyle(line: RecapCanvasLayoutLine): ViewStyle {
  if (line.startX === line.endX) {
    return {
      backgroundColor: LAYOUT_GUIDE_LINE_COLOR,
      height: `${Math.abs(line.endY - line.startY) * 100}%`,
      left: `${line.startX * 100}%`,
      position: "absolute",
      top: `${Math.min(line.startY, line.endY) * 100}%`,
      width: LAYOUT_GUIDE_LINE_WIDTH,
    };
  }

  return {
    backgroundColor: LAYOUT_GUIDE_LINE_COLOR,
    height: LAYOUT_GUIDE_LINE_WIDTH,
    left: `${Math.min(line.startX, line.endX) * 100}%`,
    position: "absolute",
    top: `${line.startY * 100}%`,
    width: `${Math.abs(line.endX - line.startX) * 100}%`,
  };
}

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    backgroundColor: appColors.white,
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  emptySlot: {
    backgroundColor: "transparent",
    height: "100%",
    width: "100%",
  },
  photo: {
    height: "100%",
    width: "100%",
  },
  slot: {
    overflow: "hidden",
    position: "absolute",
  },
  slotBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    borderColor: "#C8C8C8",
    borderRadius: 13,
    borderWidth: 1,
    height: 26,
    justifyContent: "center",
    left: "50%",
    position: "absolute",
    top: "50%",
    transform: [{ translateX: -13 }, { translateY: -13 }],
    width: 26,
  },
  slotBadgeText: {
    color: "#8C8C8C",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 17,
  },
  selectedSlotBadge: {
    backgroundColor: appColors.black,
    borderColor: appColors.black,
  },
  selectedSlotBadgeText: {
    color: appColors.white,
  },
});
