import { StyleSheet, View } from "react-native";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import type { BuiltInStickerAsset } from "@/application/services/stickers/types";
import { builtInPolaroidPreviewImageUri } from "@/presentation/assets/built-in-polaroid-preview";
import { PolaroidPhotoFrame } from "@/presentation/components/atoms/polaroid-photo-frame";
import { MonthlyRecapCalendarGrid } from "@/presentation/components/organisms/monthly-recap-calendar-grid";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

type BuiltInStickerPreviewProps = {
  asset: BuiltInStickerAsset;
  size: "detail" | "tile";
};

const PREVIEW_CALENDAR_MONTH_DATE = dayjs("2026-07-01");
const PREVIEW_CALENDAR = buildCalendarMonth(
  PREVIEW_CALENDAR_MONTH_DATE.toDate(),
  dayjs("2026-07-24").toDate(),
);

export function BuiltInStickerPreview(props: BuiltInStickerPreviewProps) {
  const { asset, size } = props;

  if (asset.variant === "calendar") {
    return (
      <View
        style={[
          styles.calendarPreview,
          size === "detail" && styles.detailCalendarPreview,
        ]}
      >
        <View
          style={[
            styles.calendarScaleContent,
            size === "detail" && styles.detailCalendarScaleContent,
          ]}
        >
          <MonthlyRecapCalendarGrid
            cells={PREVIEW_CALENDAR.days}
            monthDate={PREVIEW_CALENDAR_MONTH_DATE}
          />
        </View>
      </View>
    );
  }

  return (
    <PolaroidPhotoFrame
      imagePath={builtInPolaroidPreviewImageUri}
      orientation="landscape"
      style={[
        styles.polaroidPreview,
        size === "detail" && styles.detailPolaroidPreview,
      ]}
    />
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
    width: "86%",
  },
  calendarScaleContent: {
    height: 260,
    transform: [{ scale: 0.34 }],
    width: 260,
  },
  detailCalendarPreview: {
    height: 240,
    width: 240,
  },
  detailCalendarScaleContent: {
    transform: [{ scale: 0.82 }],
  },
  detailPolaroidPreview: {
    height: 190,
    width: 260,
  },
  polaroidPreview: {
    height: "72%",
    position: "relative",
    width: "88%",
  },
});
