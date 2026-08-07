import { StyleSheet, Text, View } from "react-native";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import type { WidgetAsset } from "@/application/services/stickers/types";
import { widgetPolaroidPreviewImageUri } from "@/presentation/assets/widget-polaroid-preview";
import { PolaroidPhotoFrame } from "@/presentation/components/atoms/polaroid-photo-frame";
import { MessageRecapBubble } from "@/presentation/components/molecules/message-recap-bubble";
import { toCalendarWeeks } from "@/presentation/helpers/calendar/calendar-weeks";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

type WidgetPreviewProps = {
  asset: WidgetAsset;
  size: "detail" | "tile";
};

const PREVIEW_CALENDAR_MONTH_DATE = dayjs("2026-07-01");
const PREVIEW_CALENDAR = buildCalendarMonth(
  PREVIEW_CALENDAR_MONTH_DATE.toDate(),
  dayjs("2026-07-24").toDate(),
);
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function WidgetPreview(props: WidgetPreviewProps) {
  const { asset, size } = props;

  if (asset.variant === "calendar") {
    return (
      <View
        style={[
          styles.calendarPreview,
          size === "detail" && styles.detailCalendarPreview,
        ]}
      >
        <MiniCalendarPreview size={size} />
      </View>
    );
  }

  if (asset.variant === "speechBubble") {
    return (
      <MessageRecapBubble
        text="안녕!"
        style={[
          styles.speechBubblePreview,
          size === "detail" && styles.detailSpeechBubblePreview,
        ]}
        textStyle={[
          styles.speechBubbleText,
          size === "detail" && styles.detailSpeechBubbleText,
        ]}
      />
    );
  }

  return (
    <PolaroidPhotoFrame
      imagePath={widgetPolaroidPreviewImageUri}
      orientation="landscape"
      style={[
        styles.polaroidPreview,
        size === "detail" && styles.detailPolaroidPreview,
      ]}
    />
  );
}

function MiniCalendarPreview(props: { size: "detail" | "tile" }) {
  const { size } = props;
  const weeks = toCalendarWeeks(PREVIEW_CALENDAR.days);

  return (
    <View style={styles.miniCalendar}>
      <View style={styles.miniCalendarHeader}>
        <Text
          style={[
            styles.miniCalendarMonthText,
            size === "detail" && styles.detailMiniCalendarMonthText,
          ]}
        >
          {PREVIEW_CALENDAR_MONTH_DATE.format("MMM")}
        </Text>
        <Text
          style={[
            styles.miniCalendarYearText,
            size === "detail" && styles.detailMiniCalendarYearText,
          ]}
        >
          {PREVIEW_CALENDAR_MONTH_DATE.format("YYYY")}
        </Text>
      </View>
      <View style={styles.miniWeekdayRow}>
        {WEEKDAYS.map((weekday, index) => (
          <Text
            key={`${weekday}-${index}`}
            style={[
              styles.miniWeekdayText,
              size === "detail" && styles.detailMiniWeekdayText,
            ]}
          >
            {weekday}
          </Text>
        ))}
      </View>
      <View style={styles.miniCalendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.miniCalendarWeek}>
            {week.map((cell, dayIndex) => {
              const isHighlighted = cell?.isToday;

              return (
                <View
                  key={cell?.key ?? `empty-${weekIndex}-${dayIndex}`}
                  style={styles.miniCalendarDay}
                >
                  {cell && (
                    <View
                      style={[
                        styles.miniCalendarDayBadge,
                        isHighlighted && styles.miniCalendarDayBadgeActive,
                        size === "detail" && styles.detailMiniCalendarDayBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.miniCalendarDayText,
                          isHighlighted && styles.miniCalendarDayTextActive,
                          size === "detail" && styles.detailMiniCalendarDayText,
                        ]}
                      >
                        {cell.dayOfMonth}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarPreview: {
    alignItems: "center",
    backgroundColor: appColors.white,
    borderCurve: "continuous",
    borderRadius: 10,
    boxShadow: "0 10px 20px rgba(18, 18, 18, 0.08)",
    height: "86%",
    justifyContent: "center",
    overflow: "hidden",
    padding: 8,
    width: "86%",
  },
  detailCalendarPreview: {
    height: 240,
    padding: 18,
    width: 240,
  },
  detailPolaroidPreview: {
    height: 190,
    width: 260,
  },
  detailSpeechBubblePreview: {
    borderRadius: 28,
    height: 112,
    width: 200,
  },
  detailSpeechBubbleText: {
    fontSize: 24,
    lineHeight: 30,
  },
  detailMiniCalendarDayBadge: {
    minHeight: 24,
    minWidth: 24,
  },
  detailMiniCalendarDayText: {
    fontSize: 12,
    lineHeight: 16,
  },
  detailMiniCalendarMonthText: {
    fontSize: 32,
    lineHeight: 38,
  },
  detailMiniCalendarYearText: {
    fontSize: 16,
    lineHeight: 22,
  },
  detailMiniWeekdayText: {
    fontSize: 10,
    lineHeight: 14,
  },
  miniCalendar: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  miniCalendarDay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  miniCalendarDayBadge: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 10,
    minWidth: 10,
  },
  miniCalendarDayBadgeActive: {
    backgroundColor: appColors.black,
  },
  miniCalendarDayText: {
    color: appColors.black,
    fontSize: 5,
    fontWeight: "800",
    lineHeight: 7,
  },
  miniCalendarDayTextActive: {
    color: appColors.white,
  },
  miniCalendarGrid: {
    gap: 1,
  },
  miniCalendarHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  miniCalendarMonthText: {
    color: appColors.black,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 16,
  },
  miniCalendarWeek: {
    flexDirection: "row",
  },
  miniCalendarYearText: {
    color: appColors.blackOverlay34,
    fontSize: 7,
    fontWeight: "800",
    lineHeight: 9,
  },
  miniWeekdayRow: {
    borderBottomColor: "rgba(18,18,18,0.08)",
    borderBottomWidth: 1,
    flexDirection: "row",
    marginBottom: 3,
    paddingBottom: 3,
  },
  miniWeekdayText: {
    color: appColors.blackOverlay34,
    flex: 1,
    fontSize: 4,
    fontWeight: "800",
    lineHeight: 6,
    textAlign: "center",
  },
  polaroidPreview: {
    height: "72%",
    position: "relative",
    width: "88%",
  },
  speechBubblePreview: {
    minHeight: 36,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  speechBubbleText: {
    fontSize: 11,
    lineHeight: 14,
  },
});
