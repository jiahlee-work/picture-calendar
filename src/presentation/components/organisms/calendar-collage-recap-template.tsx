import { Image } from "expo-image";
import type { Dayjs } from "dayjs";
import { StyleSheet, Text, View } from "react-native";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import {
  getCalendarRecapCardSize,
  getCalendarRecapPhotoSlotLayout,
} from "@/application/services/recap/monthly-recap-template-layout";
import { resolveMonthlyRecapTemplatePhotos } from "@/application/services/recap/monthly-recap-template-photos";
import { MonthlyRecapBackgroundCollage } from "@/presentation/components/molecules/monthly-recap-background-collage";
import { MonthlyRecapCalendarGrid } from "@/presentation/components/molecules/monthly-recap-calendar-grid";
import { toMonthlyRecapPhotoFrameStyle } from "@/presentation/components/organisms/monthly-recap-photo-frame-style";
import { appColors } from "@/presentation/theme/colors";
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
            <Text style={styles.calendarMonth}>{monthDate.format("MMMM")}</Text>
            <MonthlyRecapCalendarGrid cells={calendar.days} />
          </View>
          <View pointerEvents="none" style={styles.photoLayer}>
            {calendarPhotos.map((photo, index) => (
              <View
                key={photo.id}
                style={[
                  styles.photoFrameShadow,
                  toMonthlyRecapPhotoFrameStyle(
                    getCalendarRecapPhotoSlotLayout(
                      index,
                      calendarPhotos.length,
                      width,
                    ),
                  ),
                ]}
              >
                <View style={styles.photoFrame}>
                  <Image
                    contentFit="cover"
                    source={{ uri: photo.imagePath }}
                    style={styles.fillImage}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    backgroundColor: "rgba(255, 255, 252, 0.94)",
    borderRadius: 18,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  calendarMonth: {
    color: appColors.black,
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 34,
    marginBottom: 10,
  },
  canvas: {
    backgroundColor: "#e8e4db",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  fillImage: {
    height: "100%",
    width: "100%",
  },
  photoFrame: {
    backgroundColor: "#fffdfa",
    borderColor: "#fffdfa",
    borderWidth: 8,
    flex: 1,
    overflow: "hidden",
  },
  photoFrameShadow: {
    boxShadow: "0 6px 14px rgba(0, 0, 0, 0.16)",
    position: "absolute",
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
