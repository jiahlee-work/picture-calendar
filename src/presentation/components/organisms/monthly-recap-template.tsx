import { Image } from "expo-image";
import type { Dayjs } from "dayjs";
import { StyleSheet, Text, View } from "react-native";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import {
  getCalendarRecapCardSize,
  getCalendarRecapPhotoSlotLayout,
  getMessageRecapBubbleTop,
  getMessageRecapPhotoFrameLayout,
  getMonthlyRecapSeasonEmojis,
  type MonthlyRecapPhotoFrameLayout,
} from "@/application/services/recap/monthly-recap-template-layout";
import { resolveMonthlyRecapTemplatePhotos } from "@/application/services/recap/monthly-recap-template-photos";
import { MonthlyRecapBackgroundCollage } from "@/presentation/components/molecules/monthly-recap-background-collage";
import { MonthlyRecapCalendarGrid } from "@/presentation/components/molecules/monthly-recap-calendar-grid";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";
import { MonthlyRecapTemplateId, type MonthlyRecap } from "@/shared/recap/types";

const ABSOLUTE_FILL_OBJECT = {
  bottom: 0,
  left: 0,
  position: "absolute",
  right: 0,
  top: 0,
} as const;

type MonthlyRecapTemplateProps = {
  monthDate: Dayjs;
  photos: DailyPhoto[];
  recap: MonthlyRecap;
  width: number;
};

export function MonthlyRecapTemplate(props: MonthlyRecapTemplateProps) {
  const { monthDate, photos, recap, width } = props;

  if (recap.templateId === MonthlyRecapTemplateId.message) {
    return <MessageRecapTemplate monthDate={monthDate} photos={photos} recap={recap} width={width} />;
  }

  return <CalendarCollageRecapTemplate monthDate={monthDate} photos={photos} recap={recap} width={width} />;
}

function MessageRecapTemplate(props: MonthlyRecapTemplateProps) {
  const { monthDate, photos, recap, width } = props;
  const { selectedPhotos } = resolveMonthlyRecapTemplatePhotos({ photos, recap });
  const createdTimeLabel = dayjs(recap.createdAt).isValid() ? dayjs(recap.createdAt).format("HH:mm") : "09:00";
  const bubbleTop = getMessageRecapBubbleTop(selectedPhotos.length, width);

  return (
    <View style={[styles.messageCanvas, { width }]}>
      <Text style={styles.messageTime}>TODAY AT {createdTimeLabel}</Text>
      <View style={styles.messagePhotoStack}>
        {selectedPhotos.map((photo, index) => (
          <View
            key={photo.id}
            style={[
              styles.messagePhotoFrame,
              toPhotoFrameStyle(getMessageRecapPhotoFrameLayout(index, selectedPhotos.length, width)),
            ]}
          >
            <Image contentFit="cover" source={{ uri: photo.imagePath }} style={styles.fillImage} />
          </View>
        ))}
      </View>
      <View style={[styles.messageBubble, { top: bubbleTop }]}>
        <Text style={styles.messageBubbleText}>
          My {monthDate.format("MMMM YYYY")} {getMonthlyRecapSeasonEmojis(monthDate.month())}
        </Text>
        <View style={styles.messageBubbleTail} />
        <View style={styles.messageBubbleTailCutout} />
      </View>
    </View>
  );
}

function CalendarCollageRecapTemplate(props: MonthlyRecapTemplateProps) {
  const { monthDate, photos, recap, width } = props;
  const { backgroundPhotos, calendarPhotos } = resolveMonthlyRecapTemplatePhotos({ photos, recap });
  const calendar = buildCalendarMonth(monthDate.startOf("month").toDate());
  const calendarCardSize = getCalendarRecapCardSize(width);

  return (
    <View style={[styles.collageCanvas, { width }]}>
      <MonthlyRecapBackgroundCollage photos={backgroundPhotos} />
      <View style={styles.collageScrim} />
      <View style={styles.calendarStageCenter}>
        <View style={[styles.calendarStage, calendarCardSize]}>
          <View style={[styles.calendarCard, calendarCardSize]}>
            <Text style={styles.calendarMonth}>{monthDate.format("MMMM")}</Text>
            <MonthlyRecapCalendarGrid cells={calendar.days} />
          </View>
          <View pointerEvents="none" style={styles.calendarPhotoLayer}>
            {calendarPhotos.map((photo, index) => (
              <View
                key={photo.id}
                style={[
                  styles.collagePhotoFrame,
                  toPhotoFrameStyle(getCalendarRecapPhotoSlotLayout(index, calendarPhotos.length, width)),
                ]}
              >
                <Image contentFit="cover" source={{ uri: photo.imagePath }} style={styles.fillImage} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function toPhotoFrameStyle(layout: MonthlyRecapPhotoFrameLayout) {
  return {
    height: layout.height,
    left: layout.left,
    top: layout.top,
    transform: [{ rotate: layout.rotation }],
    width: layout.width,
    zIndex: layout.zIndex,
  };
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
  calendarPhotoLayer: {
    ...ABSOLUTE_FILL_OBJECT,
    overflow: "visible",
  },
  calendarStage: {
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "visible",
    position: "relative",
  },
  calendarStageCenter: {
    ...ABSOLUTE_FILL_OBJECT,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },
  collageCanvas: {
    backgroundColor: "#e8e4db",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  collagePhotoFrame: {
    backgroundColor: "#fffdfa",
    borderColor: "#fffdfa",
    borderWidth: 8,
    boxShadow: "0 6px 14px rgba(0, 0, 0, 0.16)",
    overflow: "hidden",
    position: "absolute",
  },
  collageScrim: {
    ...ABSOLUTE_FILL_OBJECT,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  fillImage: {
    height: "100%",
    width: "100%",
  },
  messageBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#1688ff",
    borderRadius: 24,
    maxWidth: "82%",
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 12,
    position: "absolute",
    right: 22,
    zIndex: 10,
  },
  messageBubbleTail: {
    backgroundColor: "#1688ff",
    borderBottomLeftRadius: 16,
    bottom: 0,
    height: 25,
    position: "absolute",
    right: -7,
    width: 20,
  },
  messageBubbleTailCutout: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 10,
    bottom: 0,
    height: 25,
    position: "absolute",
    right: -26,
    width: 26,
  },
  messageBubbleText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 28,
  },
  messageCanvas: {
    backgroundColor: "#ffffff",
    borderRadius: 0,
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  messagePhotoFrame: {
    backgroundColor: "#eeeeee",
    borderRadius: 24,
    overflow: "hidden",
    position: "absolute",
  },
  messagePhotoStack: {
    ...ABSOLUTE_FILL_OBJECT,
  },
  messageTime: {
    color: "#686868",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 20,
    position: "absolute",
    textAlign: "center",
    top: 118,
    width: "100%",
    zIndex: 4,
  },
});
