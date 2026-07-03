import { Image } from "expo-image";
import type { Dayjs } from "dayjs";
import { StyleSheet, Text, View } from "react-native";

import type { DailyPhoto } from "@/application/services/daily-photo/types";
import {
  getMessageRecapPhotoFrameLayout,
  getMessageRecapPhotoGroupSize,
  getMonthlyRecapSeasonEmojis,
} from "@/application/services/recap/monthly-recap-template-layout";
import { resolveMonthlyRecapTemplatePhotos } from "@/application/services/recap/monthly-recap-template-photos";
import { toMonthlyRecapPhotoFrameStyle } from "@/presentation/components/organisms/monthly-recap-photo-frame-style";
import { dayjs } from "@/shared/date/dayjs";
import type { MonthlyRecap } from "@/shared/recap/types";

const MESSAGE_CANVAS_HORIZONTAL_PADDING = 16;

type MessageRecapTemplateProps = {
  monthDate: Dayjs;
  photos: DailyPhoto[];
  recap: MonthlyRecap;
  width: number;
};

export function MessageRecapTemplate(props: MessageRecapTemplateProps) {
  const { monthDate, photos, recap, width } = props;
  const { selectedPhotos } = resolveMonthlyRecapTemplatePhotos({ photos, recap });
  const createdTimeLabel = dayjs(recap.createdAt).isValid() ? dayjs(recap.createdAt).format("HH:mm") : "09:00";
  const contentWidth = Math.max(0, width - MESSAGE_CANVAS_HORIZONTAL_PADDING * 2);
  const photoGroupSize = getMessageRecapPhotoGroupSize(selectedPhotos.length, contentWidth);

  return (
    <View style={[styles.canvas, { width }]}>
      <Text style={styles.time}>TODAY AT {createdTimeLabel}</Text>
      <View style={styles.body}>
        <View style={[styles.photoGroup, photoGroupSize]}>
          {selectedPhotos.map((photo, index) => (
            <View
              key={photo.id}
              style={[
                styles.photoFrame,
                toMonthlyRecapPhotoFrameStyle(getMessageRecapPhotoFrameLayout(index, selectedPhotos.length, contentWidth)),
              ]}
            >
              <Image contentFit="cover" source={{ uri: photo.imagePath }} style={styles.fillImage} />
            </View>
          ))}
        </View>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>
            My {monthDate.format("MMMM YYYY")} {getMonthlyRecapSeasonEmojis(monthDate.month())}
          </Text>
          <View style={styles.bubbleTail} />
          <View style={styles.bubbleTailCutout} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 20,
  },
  bubble: {
    alignSelf: "flex-end",
    backgroundColor: "#1688ff",
    borderRadius: 24,
    maxWidth: "82%",
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 12,
    position: "relative",
    zIndex: 10,
  },
  bubbleTail: {
    backgroundColor: "#1688ff",
    borderBottomLeftRadius: 16,
    bottom: 0,
    height: 25,
    position: "absolute",
    right: -7,
    width: 20,
  },
  bubbleTailCutout: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 10,
    bottom: 0,
    height: 25,
    position: "absolute",
    right: -26,
    width: 26,
  },
  bubbleText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 22,
  },
  canvas: {
    backgroundColor: "#ffffff",
    borderRadius: 0,
    flex: 1,
    gap: 72,
    justifyContent: "flex-start",
    overflow: "hidden",
    paddingBottom: 64,
    paddingHorizontal: MESSAGE_CANVAS_HORIZONTAL_PADDING,
    paddingTop: 118,
    position: "relative",
  },
  fillImage: {
    height: "100%",
    width: "100%",
  },
  photoFrame: {
    backgroundColor: "#eeeeee",
    borderRadius: 24,
    overflow: "hidden",
    position: "absolute",
  },
  photoGroup: {
    flexShrink: 0,
    overflow: "visible",
    position: "relative",
  },
  time: {
    alignSelf: "center",
    color: "#686868",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 20,
    textAlign: "center",
    zIndex: 4,
  },
});
