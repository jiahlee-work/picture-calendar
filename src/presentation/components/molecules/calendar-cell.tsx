import {Pressable, StyleSheet, Text, View} from "react-native";

import type {CalendarGridCell} from "@/application/services/calendar/calendar-grid";
import {DailyPhotoImage} from "@/presentation/components/atoms/daily-photo-image";
import { appColors } from "@/presentation/theme/colors";

type CalendarCellProps = {
  cellHeight: number;
  cellWidth: number;
  day: CalendarGridCell;
  selectionOrder?: number | null;
  onLongPressDate?: (dateKey: string) => void;
  onPressDate: (dateKey: string) => void;
};

export function CalendarCell(props: CalendarCellProps) {
  const { cellHeight, cellWidth, day, onLongPressDate, onPressDate, selectionOrder = null } = props;
  const isToday = day?.isToday;
  const photo = day?.photo;
  const isSelected = typeof selectionOrder === "number";

  if (!day) {
    return <View style={[styles.cell, styles.emptyCell, { height: cellHeight, width: cellWidth }]} />;
  }

  return (
    <Pressable
      accessibilityState={isSelected ? { selected: true } : undefined}
      style={[styles.cell, { height: cellHeight, width: cellWidth }, isToday && styles.todayCell]}
      onLongPress={onLongPressDate ? () => onLongPressDate(day.key) : undefined}
      onPress={() => onPressDate(day.key)}
    >
      {isToday ? <View style={styles.todayMark} /> : null}
      {photo ? <DailyPhotoImage imagePath={photo.imagePath} /> : null}
      <Text style={[styles.dateText, isToday && styles.todayText]}>{day.dayOfMonth}</Text>
      {isSelected ? (
        <View pointerEvents="none" style={styles.selectedOverlay}>
          <View style={styles.selectionBadge}>
            <Text style={styles.selectionText}>{selectionOrder}</Text>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    backgroundColor: appColors.background,
    borderColor: "#f0f0f0",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
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
});
