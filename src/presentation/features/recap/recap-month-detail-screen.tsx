import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  type MonthlyRecapDetailStatus,
  useMonthlyRecapDetail,
} from "@/application/hooks/use-monthly-recap-detail";
import { buildCalendarMonth, type CalendarGridCell } from "@/application/services/calendar/calendar-grid";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { resolveMonthlyRecapTemplatePhotos } from "@/application/services/recap/monthly-recap-template-photos";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";
import type { MonthlyRecap } from "@/shared/recap/types";

const ABSOLUTE_FILL_OBJECT = {
  bottom: 0,
  left: 0,
  position: "absolute",
  right: 0,
  top: 0,
} as const;
const MESSAGE_BUBBLE_PHOTO_GAP = 40;

type RecapMonthDetailScreenProps = {
  month: string;
  year: string;
};

export function RecapMonthDetailScreen(props: RecapMonthDetailScreenProps) {
  const { month, year } = props;
  const { width } = useWindowDimensions();
  const router = useRouter();
  const monthKey = `${year}-${month}`;
  const { photos, recap, status } = useMonthlyRecapDetail(monthKey);
  const monthDate = dayjs(`${year}-${month}-01`);
  const canvasWidth = width;

  useEffect(() => {
    if (status !== "needs_selection") {
      return;
    }

    router.replace({
      params: {
        month: monthKey,
      },
      pathname: "/recap/select",
    });
  }, [monthKey, router, status]);

  return (
    <View style={styles.screen}>
      <View style={styles.templateLayer}>
        {status === "ready" && recap ? (
          <RecapTemplate monthDate={monthDate} photos={photos} recap={recap} width={canvasWidth} />
        ) : (
          <RecapStatusPanel status={status} />
        )}
      </View>
      <SafeAreaView edges={["top"]} pointerEvents="box-none" style={styles.overlay}>
        <AppBar pointerEvents="box-none" variant="overlay">
          <AppBar.Spacer />
          <AppBar.Menu />
        </AppBar>
      </SafeAreaView>
    </View>
  );
}

function RecapTemplate({
  monthDate,
  photos,
  recap,
  width,
}: {
  monthDate: dayjs.Dayjs;
  photos: DailyPhoto[];
  recap: MonthlyRecap;
  width: number;
}) {
  if (recap.templateId === "message") {
    return <MessageRecapTemplate monthDate={monthDate} photos={photos} recap={recap} width={width} />;
  }

  return <CalendarCollageRecapTemplate monthDate={monthDate} photos={photos} recap={recap} width={width} />;
}

function MessageRecapTemplate({
  monthDate,
  photos,
  recap,
  width,
}: {
  monthDate: dayjs.Dayjs;
  photos: DailyPhoto[];
  recap: MonthlyRecap;
  width: number;
}) {
  const { selectedPhotos } = resolveMonthlyRecapTemplatePhotos({ photos, recap });
  const createdTimeLabel = dayjs(recap.createdAt).isValid() ? dayjs(recap.createdAt).format("HH:mm") : "09:00";
  const bubbleTop = toMessageBubbleTop(selectedPhotos.length, width);

  return (
    <View style={[styles.messageCanvas, { width }]}>
      <Text style={styles.messageTime}>TODAY AT {createdTimeLabel}</Text>
      <View style={styles.messagePhotoStack}>
        {selectedPhotos.map((photo, index) => (
          <View
            key={photo.id}
            style={[
              styles.messagePhotoFrame,
              toMessagePhotoFrameStyle(index, selectedPhotos.length, width),
            ]}
          >
            <Image contentFit="cover" source={{ uri: photo.imagePath }} style={styles.fillImage} />
          </View>
        ))}
      </View>
      <View style={[styles.messageBubble, { top: bubbleTop }]}>
        <Text style={styles.messageBubbleText}>My {monthDate.format("MMMM YYYY")} {toSeasonEmojis(monthDate.month())}</Text>
        <View style={styles.messageBubbleTail} />
        <View style={styles.messageBubbleTailCutout} />
      </View>
    </View>
  );
}

function CalendarCollageRecapTemplate({
  monthDate,
  photos,
  recap,
  width,
}: {
  monthDate: dayjs.Dayjs;
  photos: DailyPhoto[];
  recap: MonthlyRecap;
  width: number;
}) {
  const { backgroundPhotos, calendarPhotos } = resolveMonthlyRecapTemplatePhotos({ photos, recap });
  const calendar = buildCalendarMonth(monthDate.startOf("month").toDate());
  const calendarCardSize = toCalendarCardSize(width);

  return (
    <View style={[styles.collageCanvas, { width }]}>
      <BackgroundCollage photos={backgroundPhotos} />
      <View style={styles.collageScrim} />
      <View style={styles.calendarStageCenter}>
        <View style={[styles.calendarStage, calendarCardSize]}>
          <View style={[styles.calendarCard, calendarCardSize]}>
            <Text style={styles.calendarMonth}>{monthDate.format("MMMM")}</Text>
            <CalendarGrid cells={calendar.days} />
          </View>
          <View pointerEvents="none" style={styles.calendarPhotoLayer}>
            {calendarPhotos.map((photo, index) => (
              <View
                key={photo.id}
                style={[
                  styles.collagePhotoFrame,
                  toCalendarPhotoSlotStyle(index, calendarPhotos.length, width),
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

function BackgroundCollage({ photos }: { photos: DailyPhoto[] }) {
  if (photos.length <= 1) {
    return (
      <Image
        contentFit="cover"
        source={{ uri: photos[0]?.imagePath }}
        style={styles.backgroundImage}
      />
    );
  }

  return (
    <View style={styles.backgroundGrid}>
      {photos.slice(0, 6).map((photo) => (
        <Image key={photo.id} contentFit="cover" source={{ uri: photo.imagePath }} style={styles.backgroundGridImage} />
      ))}
    </View>
  );
}

function CalendarGrid({ cells }: { cells: CalendarGridCell[] }) {
  return (
    <View style={styles.calendarGrid}>
      {["S", "M", "T", "W", "T", "F", "S"].map((weekday, index) => (
        <Text key={`${weekday}-${index}`} style={styles.weekdayText}>{weekday}</Text>
      ))}
      {cells.map((cell, index) => (
        <View key={cell?.key ?? `empty-${index}`} style={styles.calendarCell}>
          {cell ? <Text style={styles.calendarDayText}>{cell.dayOfMonth}</Text> : null}
        </View>
      ))}
    </View>
  );
}

function RecapStatusPanel({ status }: { status: MonthlyRecapDetailStatus }) {
  if (status === "loading") {
    return (
      <View style={styles.statusPanel}>
        <ActivityIndicator color={appColors.black} />
      </View>
    );
  }

  return (
    <View style={styles.statusPanel}>
      <Text style={styles.statusText}>{toStatusLabel(status, 0, null)}</Text>
    </View>
  );
}

function toStatusLabel(status: MonthlyRecapDetailStatus, photoCount: number, templateId: string | null): string {
  if (status === "loading") {
    return "이 달의 리캡을 불러오는 중이에요.";
  }

  if (status === "error") {
    return "이 달의 리캡을 불러오지 못했습니다.";
  }

  if (status === "empty") {
    return "이 달에는 리캡에 사용할 사진이 없어요.";
  }

  if (status === "needs_selection") {
    return "대표 사진 선택 화면으로 이동 중이에요.";
  }

  if (status === "collecting") {
    return "이 달의 사진을 모으는 중이에요.";
  }

  return `${photoCount}장의 사진으로 ${templateId === "message" ? "메시지" : "캘린더"} 리캡을 준비했어요.`;
}

function toMessagePhotoFrameStyle(index: number, photoCount: number, width: number) {
  const frameStyles = toMessagePhotoFrameStyles(photoCount, width);

  return frameStyles[index] ?? frameStyles[frameStyles.length - 1];
}

function toMessagePhotoFrameStyles(photoCount: number, width: number) {
  const twoPhotoStyles = [
    {
      height: width * 0.92,
      left: width * 0.2,
      top: width * 0.48,
      transform: [{ rotate: "-4deg" }],
      width: width * 0.62,
      zIndex: 2,
    },
    {
      height: width * 0.82,
      left: width * 0.39,
      top: width * 1.03,
      transform: [{ rotate: "5deg" }],
      width: width * 0.57,
      zIndex: 3,
    },
  ];
  const threePhotoStyles = [
    {
      height: width * 0.47,
      left: width * 0.48,
      top: width * 0.37,
      transform: [{ rotate: "1deg" }],
      width: width * 0.38,
      zIndex: 2,
    },
    {
      height: width * 0.47,
      left: width * 0.34,
      top: width * 0.76,
      transform: [{ rotate: "-3deg" }],
      width: width * 0.38,
      zIndex: 3,
    },
    {
      height: width * 0.46,
      left: width * 0.48,
      top: width * 1.12,
      transform: [{ rotate: "2deg" }],
      width: width * 0.38,
      zIndex: 4,
    },
  ];
  const stylesByIndex = photoCount <= 2 ? twoPhotoStyles : threePhotoStyles;

  return stylesByIndex.slice(0, photoCount);
}

function toMessageBubbleTop(photoCount: number, width: number): number {
  const frameStyles = toMessagePhotoFrameStyles(photoCount, width);
  const photoGroupBottom = Math.max(
    0,
    ...frameStyles.map((frameStyle) => frameStyle.top + frameStyle.height),
  );

  return photoGroupBottom + MESSAGE_BUBBLE_PHOTO_GAP;
}

function toCalendarCardSize(width: number) {
  return {
    height: width * 0.59,
    width: width * 0.78,
  };
}

function toCalendarPhotoSlotStyle(index: number, photoCount: number, width: number) {
  const cardSize = toCalendarCardSize(width);
  const protectedTitleBottom = width * 0.18;
  const twoPhotoStyles = [
    {
      height: width * 0.25,
      left: -width * 0.07,
      top: protectedTitleBottom + width * 0.03,
      transform: [{ rotate: "-7deg" }],
      width: width * 0.33,
      zIndex: 6,
    },
    {
      height: width * 0.25,
      left: cardSize.width - width * 0.29,
      top: protectedTitleBottom + width * 0.09,
      transform: [{ rotate: "6deg" }],
      width: width * 0.34,
      zIndex: 7,
    },
  ];
  const stylesByIndex = [
    {
      height: width * 0.24,
      left: -width * 0.08,
      top: protectedTitleBottom + width * 0.02,
      transform: [{ rotate: "-7deg" }],
      width: width * 0.31,
      zIndex: 6,
    },
    {
      height: width * 0.25,
      left: cardSize.width - width * 0.28,
      top: protectedTitleBottom + width * 0.08,
      transform: [{ rotate: "6deg" }],
      width: width * 0.32,
      zIndex: 7,
    },
    {
      height: width * 0.23,
      left: width * 0.08,
      top: cardSize.height - width * 0.08,
      transform: [{ rotate: "4deg" }],
      width: width * 0.31,
      zIndex: 8,
    },
    {
      height: width * 0.23,
      left: cardSize.width - width * 0.39,
      top: cardSize.height - width * 0.04,
      transform: [{ rotate: "-5deg" }],
      width: width * 0.3,
      zIndex: 9,
    },
    {
      height: width * 0.21,
      left: cardSize.width * 0.35,
      top: cardSize.height - width * 0.15,
      transform: [{ rotate: "-2deg" }],
      width: width * 0.27,
      zIndex: 10,
    },
    {
      height: width * 0.21,
      left: -width * 0.04,
      top: protectedTitleBottom + width * 0.28,
      transform: [{ rotate: "5deg" }],
      width: width * 0.27,
      zIndex: 11,
    },
    {
      height: width * 0.21,
      left: cardSize.width - width * 0.25,
      top: protectedTitleBottom + width * 0.3,
      transform: [{ rotate: "-4deg" }],
      width: width * 0.27,
      zIndex: 12,
    },
    {
      height: width * 0.2,
      left: cardSize.width * 0.36,
      top: protectedTitleBottom + width * 0.2,
      transform: [{ rotate: "3deg" }],
      width: width * 0.25,
      zIndex: 13,
    },
  ];
  const resolvedStyles = photoCount <= 2 ? twoPhotoStyles : stylesByIndex;

  return resolvedStyles[index] ?? resolvedStyles[resolvedStyles.length - 1];
}

function toSeasonEmojis(monthIndex: number): string {
  const emojis = ["❄️☕️🧣", "💌❄️🌙", "🌱🌷☀️", "🌷🌿☀️", "🌿🌼☀️", "☀️🌿🌊", "🍉☀️🌊", "🌊☀️🍧", "🍂🌾☕️", "🎃🍂🌙", "🧣🍁☕️", "✨❄️🎄"];

  return emojis[monthIndex] ?? "✨🌙";
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appColors.background,
    flex: 1,
  },
  templateLayer: {
    ...ABSOLUTE_FILL_OBJECT,
  },
  overlay: {
    ...ABSOLUTE_FILL_OBJECT,
    zIndex: 20,
  },
  statusPanel: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  statusText: {
    color: "#7b7b7b",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22,
    textAlign: "center",
  },
  messageCanvas: {
    backgroundColor: "#ffffff",
    borderRadius: 0,
    flex: 1,
    overflow: "hidden",
    position: "relative",
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
  messagePhotoStack: {
    ...ABSOLUTE_FILL_OBJECT,
  },
  messagePhotoFrame: {
    backgroundColor: "#eeeeee",
    borderRadius: 24,
    overflow: "hidden",
    position: "absolute",
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
  collageCanvas: {
    backgroundColor: "#e8e4db",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  backgroundImage: {
    ...ABSOLUTE_FILL_OBJECT,
  },
  backgroundGrid: {
    ...ABSOLUTE_FILL_OBJECT,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  backgroundGridImage: {
    height: "50%",
    width: "50%",
  },
  collageScrim: {
    ...ABSOLUTE_FILL_OBJECT,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  calendarStageCenter: {
    ...ABSOLUTE_FILL_OBJECT,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },
  calendarStage: {
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "visible",
    position: "relative",
  },
  calendarCard: {
    backgroundColor: "rgba(255, 255, 252, 0.94)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  collagePhotoFrame: {
    backgroundColor: "#fffdfa",
    borderColor: "#fffdfa",
    borderWidth: 8,
    boxShadow: "0 6px 14px rgba(0, 0, 0, 0.16)",
    overflow: "hidden",
    position: "absolute",
  },
  calendarPhotoLayer: {
    ...ABSOLUTE_FILL_OBJECT,
    overflow: "visible",
  },
  fillImage: {
    height: "100%",
    width: "100%",
  },
});
