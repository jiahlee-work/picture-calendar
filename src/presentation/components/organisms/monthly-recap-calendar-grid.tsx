import type { Dayjs } from "dayjs";
import { StyleSheet, Text, View } from "react-native";

import type { CalendarGridCell } from "@/application/services/calendar/calendar-grid";
import { toCalendarWeeks } from "@/presentation/helpers/calendar/calendar-weeks";
import { appColors } from "@/presentation/theme/colors";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

type MonthlyRecapCalendarGridProps = {
  cells: CalendarGridCell[];
  monthDate: Dayjs;
};

export function MonthlyRecapCalendarGrid(props: MonthlyRecapCalendarGridProps) {
  const { cells, monthDate } = props;
  const weeks = toCalendarWeeks(cells);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.monthText}>{monthDate.format("MMMM")}</Text>
        <Text style={styles.yearText}>{monthDate.format("YYYY")}</Text>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((weekday, index) => (
          <View key={`${weekday}-${index}`} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{weekday}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekRow}>
            {week.map((cell, dayIndex) => (
              <View
                key={cell?.key ?? `empty-${weekIndex}-${dayIndex}`}
                style={styles.calendarCell}
              >
                {cell && (
                  <Text style={styles.calendarDayText}>{cell.dayOfMonth}</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarCell: {
    alignItems: "center",
    aspectRatio: 1,
    flex: 1,
    justifyContent: "center",
  },
  calendarDayText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
  grid: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  monthText: {
    color: appColors.black,
    flexShrink: 1,
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 46,
  },
  root: {
    flex: 1,
    justifyContent: "flex-start",
  },
  weekRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
  },
  weekdayCell: {
    alignItems: "center",
    flex: 1,
  },
  weekdayRow: {
    borderBottomColor: "#efefef",
    borderBottomWidth: 1,
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 8,
  },
  weekdayText: {
    color: "#9aa0a6",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
    textAlign: "center",
  },
  yearText: {
    color: "#9aa0a6",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
});
