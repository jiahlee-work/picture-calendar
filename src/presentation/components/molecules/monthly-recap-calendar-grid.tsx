import { StyleSheet, Text, View } from "react-native";

import type { CalendarGridCell } from "@/application/services/calendar/calendar-grid";
import { appColors } from "@/presentation/theme/colors";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

type MonthlyRecapCalendarGridProps = {
  cells: CalendarGridCell[];
};

export function MonthlyRecapCalendarGrid(props: MonthlyRecapCalendarGridProps) {
  const { cells } = props;

  return (
    <View style={styles.calendarGrid}>
      {WEEKDAYS.map((weekday, index) => (
        <Text key={`${weekday}-${index}`} style={styles.weekdayText}>
          {weekday}
        </Text>
      ))}
      {cells.map((cell, index) => (
        <View key={cell?.key ?? `empty-${index}`} style={styles.calendarCell}>
          {cell ? <Text style={styles.calendarDayText}>{cell.dayOfMonth}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  calendarCell: {
    alignItems: "center",
    borderTopColor: "rgba(18, 18, 18, 0.12)",
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 27,
    justifyContent: "center",
    width: "14.285714%",
  },
  calendarDayText: {
    color: appColors.black,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  weekdayText: {
    color: "#6f6f6f",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 16,
    textAlign: "center",
    width: "14.285714%",
  },
});
