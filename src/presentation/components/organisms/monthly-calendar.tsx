import { useMemo, useState } from "react";
import { type LayoutChangeEvent, PanResponder, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import type { CalendarMonth } from "@/application/services/calendar/calendar-grid";
import { CalendarCell } from "@/presentation/components/molecules/calendar-cell";
import { appColors } from "@/presentation/theme/colors";

const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const CALENDAR_CELL_ASPECT_RATIO = 0.58;

type MonthlyCalendarProps = {
  calendar: CalendarMonth;
  canSwipeMonth?: boolean;
  contentWidth?: number;
  selectedDateKeys?: string[];
  onLongPressDate?: (dateKey: string) => void;
  onNextMonth?: () => void;
  onPreviousMonth?: () => void;
  onSelectDate: (dateKey: string) => void;
};

export function MonthlyCalendar(props: MonthlyCalendarProps) {
  const {
    calendar,
    canSwipeMonth = true,
    contentWidth,
    onLongPressDate,
    onNextMonth,
    onPreviousMonth,
    onSelectDate,
    selectedDateKeys = [],
  } = props;
  const { width: windowWidth } = useWindowDimensions();
  const [gridHeight, setGridHeight] = useState(0);
  const rowCount = Math.max(1, calendar.days.length / 7);
  const cellWidth = (contentWidth ?? windowWidth) / 7;
  const fallbackCellHeight = cellWidth / CALENDAR_CELL_ASPECT_RATIO;
  const cellHeight = gridHeight > 0 ? gridHeight / rowCount : fallbackCellHeight;
  const selectionOrderByDateKey = useMemo(
    () => new Map(selectedDateKeys.map((dateKey, index) => [dateKey, index + 1])),
    [selectedDateKeys],
  );
  const swipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          canSwipeMonth && Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 52) {
            onPreviousMonth?.();
          }

          if (gesture.dx < -52) {
            onNextMonth?.();
          }
        },
      }),
    [canSwipeMonth, onNextMonth, onPreviousMonth],
  );

  const handleGridLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);

    setGridHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
  };

  return (
    <View style={styles.card} {...swipeResponder.panHandlers}>
      <View style={styles.weekHeader}>
        {WEEK_DAYS.map((day) => (
          <Text key={day} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid} onLayout={handleGridLayout}>
        {calendar.days.map((day, index) => (
          <CalendarCell
            key={day?.key ?? `empty-${calendar.title}-${index}`}
            cellHeight={cellHeight}
            cellWidth={cellWidth}
            day={day}
            selectionOrder={day ? selectionOrderByDateKey.get(day.key) ?? null : null}
            onLongPressDate={onLongPressDate}
            onPressDate={onSelectDate}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: appColors.background,
    borderRadius: 0,
    flex: 1,
    overflow: "hidden",
  },
  weekHeader: {
    borderBottomColor: "#eeeeee",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 2,
  },
  weekday: {
    backgroundColor: appColors.background,
    color: "#9a9a9a",
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    paddingBottom: 12,
    paddingTop: 8,
    textAlign: "center",
  },
  grid: {
    backgroundColor: appColors.background,
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    overflow: "hidden",
  },
});
