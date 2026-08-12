import { Pressable, StyleSheet, Text, View } from "react-native";

import type { CalendarGridCell } from "@/application/services/calendar/calendar-grid";
import { DailyPhotoImage } from "@/presentation/components/atoms/daily-photo-image";
import { SelectionCheckbox } from "@/presentation/components/atoms/selection-checkbox";
import { appColors } from "@/presentation/theme/colors";

type CalendarCellProps = {
  cellHeight: number;
  cellWidth: number;
  day: CalendarGridCell;
  selectionOrder?: number | null;
  selectionCheckbox?: {
    accessibilityLabel: string;
    isSelected: boolean;
    onPress: () => void;
  };
  onLongPressDate?: (dateKey: string) => void;
  onPressDate: (dateKey: string) => void;
};

export function CalendarCell(props: CalendarCellProps) {
  const {
    cellHeight,
    cellWidth,
    day,
    onLongPressDate,
    onPressDate,
    selectionOrder = null,
    selectionCheckbox,
  } = props;
  const isToday = day?.isToday;
  const photo = day?.photo;
  const isSelected = typeof selectionOrder === "number";

  if (!day) {
    return (
      <View
        style={[
          styles.cell,
          styles.emptyCell,
          { height: cellHeight, width: cellWidth },
        ]}
      />
    );
  }

  return (
    <Pressable
      accessibilityLabel={selectionCheckbox?.accessibilityLabel}
      accessibilityState={
        isSelected || selectionCheckbox?.isSelected
          ? { selected: true }
          : undefined
      }
      style={[
        styles.cell,
        { height: cellHeight, width: cellWidth },
        isToday && styles.todayCell,
      ]}
      onLongPress={onLongPressDate ? () => onLongPressDate(day.key) : undefined}
      onPress={() => onPressDate(day.key)}
    >
      {isToday && <View style={styles.todayMark} />}
      {photo && <DailyPhotoImage imagePath={photo.imagePath} />}
      <Text style={[styles.dateText, isToday && styles.todayText]}>
        {day.dayOfMonth}
      </Text>
      {selectionCheckbox?.isSelected ? (
        <SelectionCheckbox
          accessibilityLabel={selectionCheckbox.accessibilityLabel}
          isSelected={selectionCheckbox.isSelected}
          size={24}
          style={styles.selectionCheckbox}
          onPress={selectionCheckbox.onPress}
        />
      ) : null}
      {isSelected && (
        <View pointerEvents="none" style={styles.selectedOverlay}>
          <View style={styles.selectionBadge}>
            <Text style={styles.selectionText}>{selectionOrder}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    backgroundColor: appColors.background,
    overflow: "hidden",
    position: "relative",
  },
  emptyCell: {
    backgroundColor: appColors.background,
  },
  todayCell: {
    backgroundColor: "#eeeeee",
  },
  dateText: {
    color: appColors.black,
    fontSize: 15,
    fontWeight: "400",
    left: 0,
    position: "absolute",
    right: 0,
    textAlign: "center",
    top: 9,
    zIndex: 2,
  },
  todayText: {
    backgroundColor: appColors.black,
    borderRadius: 999,
    color: "#ffffff",
    fontWeight: "900",
    height: 28,
    left: "50%",
    lineHeight: 28,
    marginLeft: -14,
    overflow: "hidden",
    top: 6,
    width: 28,
  },
  todayMark: {
    backgroundColor: "#eeeeee",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 0,
  },
  selectedOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(18, 18, 18, 0.38)",
    bottom: 0,
    justifyContent: "flex-end",
    left: 0,
    padding: 6,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 3,
  },
  selectionBadge: {
    alignItems: "center",
    backgroundColor: appColors.black,
    borderColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  selectionText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 16,
    textAlign: "center",
  },
  selectionCheckbox: {
    bottom: 4,
    left: "50%",
    position: "absolute",
    transform: [{ translateX: -12 }],
    zIndex: 4,
  },
});
