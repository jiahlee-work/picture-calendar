import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppText as Text } from "@/presentation/components/atoms/app-text";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import { translate } from "@/application/services/localization/app-i18n";
import type { WidgetAsset } from "@/application/services/stickers/types";
import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
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
          size === "tile" && styles.tileCalendarPreview,
          size === "detail" && styles.detailCalendarPreview,
        ]}
      >
        <MiniCalendarPreview />
      </View>
    );
  }

  if (asset.variant === "speechBubble") {
    return (
      <MessageRecapBubble
        tailScale={size === "tile" ? 0.65 : 1}
        text={translate("widgets.greeting")}
        style={[
          styles.speechBubblePreview,
          size === "tile" && styles.tileSpeechBubblePreview,
          size === "detail" && styles.detailSpeechBubblePreview,
        ]}
        textStyle={[
          styles.speechBubbleText,
          size === "tile" && styles.tileSpeechBubbleText,
          size === "detail" && styles.detailSpeechBubbleText,
        ]}
      />
    );
  }

  const isPortrait = asset.variant === "polaroidFramePortrait";

  return (
    <View
      style={[
        styles.polaroidPreview,
        isPortrait && styles.polaroidPreviewPortrait,
        size === "detail" && styles.detailPolaroidPreview,
        size === "detail" && isPortrait && styles.detailPolaroidPreviewPortrait,
      ]}
    >
      <View style={styles.polaroidPreviewPhoto}>
        <ReiconIcon
          color={appColors.blackOverlay34}
          name="GalleryAdd"
          size={size === "tile" ? 18 : 24}
        />
      </View>
    </View>
  );
}

function MiniCalendarPreview() {
  const weeks = toCalendarWeeks(PREVIEW_CALENDAR.days);
  const [viewportSize, setViewportSize] = useState({ height: 0, width: 0 });
  const [calendarSize, setCalendarSize] = useState({ height: 0, width: 0 });
  const scale =
    viewportSize.width > 0 && calendarSize.width > 0
      ? Math.min(
          viewportSize.width / calendarSize.width,
          viewportSize.height / calendarSize.height,
        )
      : 1;

  return (
    <View
      style={styles.miniCalendarViewport}
      onLayout={(event) => {
        setViewportSize({
          height: event.nativeEvent.layout.height,
          width: event.nativeEvent.layout.width,
        });
      }}
    >
      <View
        style={[styles.miniCalendar, { transform: [{ scale }] }]}
        onLayout={(event) => {
          setCalendarSize({
            height: event.nativeEvent.layout.height,
            width: event.nativeEvent.layout.width,
          });
        }}
      >
        <View style={styles.miniCalendarHeader}>
          <Text style={styles.miniCalendarMonthText}>
            {PREVIEW_CALENDAR_MONTH_DATE.format("MMMM")}
          </Text>
          <Text style={styles.miniCalendarYearText}>
            {PREVIEW_CALENDAR_MONTH_DATE.format("YYYY")}
          </Text>
        </View>
        <View style={styles.miniWeekdayRow}>
          {WEEKDAYS.map((weekday, index) => (
            <Text key={`${weekday}-${index}`} style={styles.miniWeekdayText}>
              {weekday}
            </Text>
          ))}
        </View>
        <View style={styles.miniCalendarGrid}>
          {weeks.map((week, weekIndex) => (
            <View
              key={`week-${weekIndex}`}
              style={[
                styles.miniCalendarWeek,
                weekIndex < weeks.length - 1 && styles.miniCalendarWeekDivider,
              ]}
            >
              {week.map((cell, dayIndex) => (
                <View
                  key={cell?.key ?? `empty-${weekIndex}-${dayIndex}`}
                  style={styles.miniCalendarDay}
                >
                  {cell && (
                    <Text style={styles.miniCalendarDayText}>
                      {cell.dayOfMonth}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarPreview: {
    alignItems: "center",
    backgroundColor: "transparent",
    boxShadow: "none",
    height: "86%",
    justifyContent: "center",
    overflow: "hidden",
    paddingVertical: 8,
    width: "86%",
  },
  detailCalendarPreview: {
    height: 240,
    paddingVertical: 18,
    width: 240,
  },
  detailPolaroidPreview: {
    height: 190,
    width: 260,
  },
  detailPolaroidPreviewPortrait: {
    height: 260,
    width: 190,
  },
  detailSpeechBubblePreview: {
    minHeight: 46,
    minWidth: 72,
    transform: [{ scale: 1 }],
  },
  detailSpeechBubbleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  detailMiniCalendarDayBadge: {
    minHeight: 24,
    minWidth: 24,
  },
  detailMiniCalendarDayText: {
    fontSize: 12,
    lineHeight: 16,
    transform: [{ translateY: -4 }],
  },
  detailMiniCalendarMonthText: {
    fontSize: 24,
    lineHeight: 30,
  },
  detailMiniCalendarYearText: {
    fontSize: 16,
    lineHeight: 22,
  },
  detailMiniWeekdayText: {
    fontSize: 10,
    lineHeight: 14,
  },
  detailMiniCalendarDay: {
    minHeight: 28,
  },
  detailMiniCalendarWeek: {
    minHeight: 28,
  },
  miniCalendar: {
    backgroundColor: appColors.white,
    borderCurve: "continuous",
    borderRadius: 12,
    boxShadow: "none",
    flexGrow: 0,
    justifyContent: "flex-start",
    paddingBottom: 10,
    paddingHorizontal: 18,
    paddingTop: 10,
    width: 240,
  },
  miniCalendarViewport: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  miniCalendarDay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 30,
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
    fontSize: 9,
    fontWeight: "500",
    lineHeight: 12,
    transform: [{ translateY: -1 }],
  },
  miniCalendarGrid: {
    width: "100%",
  },
  miniCalendarHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  miniCalendarMonthText: {
    color: appColors.black,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },
  miniCalendarWeek: {
    flexDirection: "row",
    minHeight: 30,
  },
  miniCalendarWeekDivider: {
    borderBottomColor: "#D1D1D1",
    borderBottomWidth: 1,
  },
  miniCalendarYearText: {
    color: appColors.blackOverlay34,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
  },
  miniWeekdayRow: {
    borderBottomColor: "#D1D1D1",
    borderBottomWidth: 1,
    flexDirection: "row",
    marginBottom: 0,
    paddingBottom: 6,
  },
  miniWeekdayText: {
    color: appColors.blackOverlay34,
    flex: 1,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 16,
    textAlign: "center",
  },
  polaroidPreview: {
    backgroundColor: "#fffdfa",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.18)",
    height: "72%",
    paddingBottom: 14,
    paddingHorizontal: 7,
    paddingTop: 7,
    position: "relative",
    width: "88%",
  },
  polaroidPreviewPhoto: {
    alignItems: "center",
    backgroundColor: "#e9e9e4",
    flex: 1,
    justifyContent: "center",
  },
  polaroidPreviewPortrait: {
    height: "88%",
    width: "72%",
  },
  speechBubblePreview: {
    alignSelf: "center",
    maxWidth: 280,
    minHeight: 46,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  speechBubbleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  tileSpeechBubblePreview: {
    minHeight: 30,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tileSpeechBubbleText: {
    fontSize: 12,
    lineHeight: 16,
  },
  tileCalendarPreview: {
    backgroundColor: appColors.white,
    borderCurve: "continuous",
    borderRadius: 4,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.18)",
    height: "80%",
    overflow: "visible",
    paddingVertical: 0,
  },
});
