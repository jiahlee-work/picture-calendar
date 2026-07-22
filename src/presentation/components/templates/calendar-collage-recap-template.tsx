import type { Dayjs } from "dayjs";
import { StyleSheet, View } from "react-native";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import {
  getCalendarRecapCardSize,
  getCalendarRecapPhotoSlotLayout,
  type MonthlyRecapPhotoFrameLayout,
} from "@/application/services/recap/monthly-recap-template-layout";
import { resolveMonthlyRecapTemplatePhotos } from "@/application/services/recap/monthly-recap-template-photos";
import {
  PolaroidPhotoFrame,
  type PolaroidPhotoFrameOrientation,
} from "@/presentation/components/atoms/polaroid-photo-frame";
import { MonthlyRecapBackgroundCollage } from "@/presentation/components/molecules/monthly-recap-background-collage";
import { MonthlyRecapCalendarGrid } from "@/presentation/components/molecules/monthly-recap-calendar-grid";
import { toMonthlyRecapPhotoFrameStyle } from "@/presentation/components/templates/monthly-recap-photo-frame-style";
import type { MonthlyRecap } from "@/shared/recap/types";

type CalendarCollageRecapTemplateProps = {
  monthDate: Dayjs;
  photos: DailyPhoto[];
  recap: MonthlyRecap;
  width: number;
};

export function CalendarCollageRecapTemplate(
  props: CalendarCollageRecapTemplateProps,
) {
  const { monthDate, photos, recap, width } = props;
  const { backgroundPhotos, calendarPhotos } =
    resolveMonthlyRecapTemplatePhotos({ photos, recap });
  const calendar = buildCalendarMonth(monthDate.startOf("month").toDate());
  const calendarCardSize = getCalendarRecapCardSize(width);

  return (
    <View style={[styles.canvas, { width }]}>
      <MonthlyRecapBackgroundCollage photos={backgroundPhotos} />
      <View style={styles.scrim} />
      <View style={styles.stageCenter}>
        <View style={[styles.stage, calendarCardSize]}>
          <View style={[styles.calendarCard, calendarCardSize]}>
            <MonthlyRecapCalendarGrid
              cells={calendar.days}
              monthDate={monthDate}
            />
          </View>
          <View pointerEvents="none" style={styles.photoLayer}>
            {calendarPhotos.map((photo, index) => {
              const layout = getCalendarRecapPhotoSlotLayout(
                index,
                calendarPhotos.length,
                width,
              );

              return (
                <PolaroidPhotoFrame
                  key={photo.id}
                  imagePath={photo.imagePath}
                  orientation={toPolaroidFrameOrientation(layout)}
                  style={toMonthlyRecapPhotoFrameStyle(layout)}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

function toPolaroidFrameOrientation(
  layout: MonthlyRecapPhotoFrameLayout,
): PolaroidPhotoFrameOrientation {
  return layout.width >= layout.height ? "landscape" : "portrait";
}

const styles = StyleSheet.create({
  calendarCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
    justifyContent: "flex-start",
    paddingBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  canvas: {
    backgroundColor: "#e8e4db",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  photoLayer: {
    bottom: 0,
    left: 0,
    overflow: "visible",
    position: "absolute",
    right: 0,
    top: 0,
  },
  scrim: {
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  stage: {
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "visible",
    position: "relative",
  },
  stageCenter: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 4,
  },
});
