import {Pressable, StyleSheet, Text, View} from "react-native";

import type {CalendarGridCell} from "@/application/services/calendar/calendar-grid";
import {DailyPhotoImage} from "@/presentation/components/atoms/daily-photo-image";
import { appColors } from "@/presentation/theme/colors";

type CalendarCellProps = {
  cellHeight: number;
  cellWidth: number;
  day: CalendarGridCell;
  onPressDate: (dateKey: string) => void;
};

export function CalendarCell(props: CalendarCellProps) {
  const { cellHeight, cellWidth, day, onPressDate } = props;
  const isToday = day?.isToday;
  const photo = day?.photo;

  if (!day) {
    return <View style={[styles.cell, styles.emptyCell, { height: cellHeight, width: cellWidth }]} />;
  }

  return (
    <Pressable style={[styles.cell, { height: cellHeight, width: cellWidth }, isToday && styles.todayCell]} onPress={() => onPressDate(day.key)}>
      {isToday ? <View style={styles.todayMark} /> : null}
      {photo ? <DailyPhotoImage imagePath={photo.imagePath} /> : null}
      <Text style={[styles.dateText, isToday && styles.todayText]}>{day.dayOfMonth}</Text>
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
});
