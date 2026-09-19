import { useRef, useState } from "react";
import {
  Alert,
  type LayoutChangeEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { useTodayPhotoFlow } from "@/application/hooks/use-today-photo-flow";
import {
  addNavigableCalendarMonths,
  clampCalendarMonth,
} from "@/application/services/calendar/calendar-month-navigation";
import { runtimePlatform } from "@/infrastructure/device/runtime-platform";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { DailyPhotoPolicyDialog } from "@/presentation/components/organisms/daily-photo-policy-dialog";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { CalendarWheelPickerSheet } from "@/presentation/components/organisms/calendar-wheel-picker-sheet";
import { DailyPhotoDetailSheet } from "@/presentation/components/organisms/daily-photo-detail-sheet";
import { MonthlyCalendar } from "@/presentation/components/organisms/monthly-calendar";
import { RecapCanvasAspectRatioSheet } from "@/presentation/components/organisms/recap-canvas-aspect-ratio-sheet";
import {
  ShareCaptureMenu,
  type ShareCaptureMenuHandle,
} from "@/presentation/components/organisms/share-capture-menu";
import { ShareExportActionSheet } from "@/presentation/components/organisms/share-export-action-sheet";
import { getCanvasDimensions } from "@/presentation/helpers/canvas/canvas-aspect-ratio-layout";
import { appColors } from "@/presentation/theme/colors";
import { appSpacing } from "@/presentation/theme/spacing";
import { dayjs } from "@/shared/date/dayjs";
import {
  RecapCanvasAspectRatio,
  type RecapCanvasAspectRatio as RecapCanvasAspectRatioType,
} from "@/shared/recap/types";

type ShareContentLayout = {
  height: number;
  width: number;
};

const COMPACT_CALENDAR_TITLE_MAX_WIDTH = 389;

export function MonthlyCalendarScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const shareCaptureRef = useRef<View>(null);
  const shareCaptureMenuRef = useRef<ShareCaptureMenuHandle>(null);
  const pendingShareFlowRef = useRef<"actions" | "share" | null>(null);
  const pendingExportActionRef = useRef<"save" | "share" | null>(null);
  const [activeMonth, setActiveMonth] = useState(() =>
    clampCalendarMonth(dayjs().startOf("month").toDate()),
  );
  const [isYearMonthPickerVisible, setIsYearMonthPickerVisible] =
    useState(false);
  const [shareContentLayout, setShareContentLayout] =
    useState<ShareContentLayout | null>(null);
  const [shareAspectRatio, setShareAspectRatio] =
    useState<RecapCanvasAspectRatioType>(RecapCanvasAspectRatio.device);
  const [pendingShareAspectRatio, setPendingShareAspectRatio] =
    useState<RecapCanvasAspectRatioType>(RecapCanvasAspectRatio.device);
  const [isShareAspectRatioSheetVisible, setIsShareAspectRatioSheetVisible] =
    useState(false);
  const [isShareExportActionSheetVisible, setIsShareExportActionSheetVisible] =
    useState(false);
  const {
    calendar,
    photoDetail,
    policyDialog,
    dismissDialog,
    dismissPhotoDetail,
    handleChangeSelectedPhoto,
    handleDeleteSelectedPhoto,
    handleSelectDate,
  } = useTodayPhotoFlow(activeMonth);
  const calendarTitleStyle =
    windowWidth <= COMPACT_CALENDAR_TITLE_MAX_WIDTH
      ? styles.compactCalendarTitle
      : undefined;
  const isShareReady = calendar.days.length > 0;
  const shareFileName = dayjs(activeMonth).format("YYYY-MM");
  const shareCanvasDimensions = shareContentLayout
    ? getCanvasDimensions(shareAspectRatio, shareContentLayout)
    : null;

  const handlePreviousMonth = () => {
    setActiveMonth((current) => addNavigableCalendarMonths(current, -1));
  };

  const handleNextMonth = () => {
    setActiveMonth((current) => addNavigableCalendarMonths(current, 1));
  };

  const handleOpenYearMonthPicker = () => {
    setIsYearMonthPickerVisible(true);
  };

  const handleCloseYearMonthPicker = () => {
    setIsYearMonthPickerVisible(false);
  };

  const handleConfirmYearMonth = (date: Date) => {
    setActiveMonth(clampCalendarMonth(date));
    setIsYearMonthPickerVisible(false);
  };

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const nextLayout = {
      height: Math.round(event.nativeEvent.layout.height),
      width: Math.round(event.nativeEvent.layout.width),
    };

    setShareContentLayout((currentLayout) => {
      if (
        currentLayout?.height === nextLayout.height &&
        currentLayout.width === nextLayout.width
      ) {
        return currentLayout;
      }

      return nextLayout;
    });
  };

  const handleOpenShareAspectRatioSheet = () => {
    setPendingShareAspectRatio(shareAspectRatio);
    setIsShareAspectRatioSheetVisible(true);
  };

  const handleCancelShareAspectRatio = () => {
    pendingShareFlowRef.current = null;
    setIsShareAspectRatioSheetVisible(false);
  };

  const handleConfirmShareAspectRatio = () => {
    setShareAspectRatio(pendingShareAspectRatio);
    pendingShareFlowRef.current =
      runtimePlatform === "android" ? "actions" : "share";
    setIsShareAspectRatioSheetVisible(false);
  };

  const handleCloseShareAspectRatioSheet = () => {
    setIsShareAspectRatioSheetVisible(false);

    const nextShareFlow = pendingShareFlowRef.current;
    pendingShareFlowRef.current = null;

    if (nextShareFlow === "actions") {
      requestAnimationFrame(() => setIsShareExportActionSheetVisible(true));
      return;
    }

    if (nextShareFlow === "share") {
      requestAnimationFrame(() => shareCaptureMenuRef.current?.shareImage());
    }
  };

  const handleRequestExportAction = (action: "save" | "share") => {
    pendingExportActionRef.current = action;
    setIsShareExportActionSheetVisible(false);
  };

  const handleCloseShareExportActionSheet = () => {
    setIsShareExportActionSheetVisible(false);

    const action = pendingExportActionRef.current;
    pendingExportActionRef.current = null;

    if (!action) {
      return;
    }

    requestAnimationFrame(() => {
      if (action === "save") {
        shareCaptureMenuRef.current?.saveImage();
        return;
      }

      shareCaptureMenuRef.current?.shareImage();
    });
  };

  const handleRequestDeletePhoto = () => {
    Alert.alert(
      "사진 삭제",
      "정말 삭제하시겠습니까? 삭제된 사진은 복구되지 않습니다",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "확인",
          style: "destructive",
          onPress: () => {
            void handleDeleteSelectedPhoto();
          },
        },
      ],
    );
  };

  return (
    <AppSafeAreaView>
      <View style={styles.container} onLayout={handleContainerLayout}>
        <AppBar>
          <AppBar.Title
            accessibilityLabel="연월 선택 열기"
            shouldTruncate={false}
            style={calendarTitleStyle}
            variant="large"
            onPress={handleOpenYearMonthPicker}
          >
            {calendar.title}
          </AppBar.Title>
          <View style={styles.appBarActions}>
            <ShareCaptureMenu
              ref={shareCaptureMenuRef}
              accessibilityLabel="캘린더 공유 버튼"
              captureHeight={shareCanvasDimensions?.height}
              captureRef={shareCaptureRef}
              captureWidth={shareCanvasDimensions?.width}
              fileName={shareFileName}
              isReady={isShareReady && Boolean(shareCanvasDimensions)}
              onPress={handleOpenShareAspectRatioSheet}
            />
          </View>
        </AppBar>
        <View style={styles.content}>
          <MonthlyCalendar
            calendar={calendar}
            canSwipeMonth
            onNextMonth={handleNextMonth}
            onPreviousMonth={handlePreviousMonth}
            onSelectDate={handleSelectDate}
          />
        </View>
      </View>
      {shareCanvasDimensions && (
        <View
          ref={shareCaptureRef}
          collapsable={false}
          pointerEvents="none"
          renderToHardwareTextureAndroid
          style={[
            styles.shareCaptureCanvas,
            {
              height: shareCanvasDimensions.height,
              transform: [{ translateX: -(shareCanvasDimensions.width + 120) }],
              width: shareCanvasDimensions.width,
            },
          ]}
        >
          <View style={styles.shareCalendarContent}>
            <AppBar>
              <AppBar.Title
                shouldTruncate={false}
                style={calendarTitleStyle}
                variant="large"
              >
                {calendar.title}
              </AppBar.Title>
            </AppBar>
            <View style={styles.content}>
              <MonthlyCalendar
                calendar={calendar}
                canSwipeMonth={false}
                contentWidth={shareCanvasDimensions.width}
                showTodayHighlight={false}
                onSelectDate={() => {}}
              />
            </View>
          </View>
        </View>
      )}
      <DailyPhotoPolicyDialog dialog={policyDialog} onCancel={dismissDialog} />
      <RecapCanvasAspectRatioSheet
        confirmLabel="공유"
        subtitle={
          "이번 달 캘린더를 원하는 비율의 이미지로 공유할 수 있어요.\n공유할 비율을 선택해 주세요."
        }
        title="캘린더 이미지 공유"
        value={pendingShareAspectRatio}
        visible={isShareAspectRatioSheetVisible}
        onCancel={handleCancelShareAspectRatio}
        onClose={handleCloseShareAspectRatioSheet}
        onConfirm={handleConfirmShareAspectRatio}
        onSelect={setPendingShareAspectRatio}
      />
      <ShareExportActionSheet
        visible={isShareExportActionSheetVisible}
        onClose={handleCloseShareExportActionSheet}
        onSave={() => handleRequestExportAction("save")}
        onShare={() => handleRequestExportAction("share")}
      />
      <DailyPhotoDetailSheet
        dateLabel={photoDetail?.dateLabel ?? ""}
        isToday={photoDetail?.isToday ?? false}
        photo={photoDetail?.photo ?? null}
        visible={Boolean(photoDetail)}
        onChangePhoto={handleChangeSelectedPhoto}
        onClose={dismissPhotoDetail}
        onDeletePhoto={handleRequestDeletePhoto}
      />
      {isYearMonthPickerVisible && (
        <CalendarWheelPickerSheet
          value={activeMonth}
          visible={isYearMonthPickerVisible}
          onClose={handleCloseYearMonthPicker}
          onConfirm={handleConfirmYearMonth}
        />
      )}
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  compactCalendarTitle: {
    fontSize: 30,
    lineHeight: 36,
  },
  content: {
    flex: 1,
    paddingTop: appSpacing.screenContentTopPadding,
  },
  appBarActions: {
    flexDirection: "row",
    gap: 10,
  },
  shareCaptureCanvas: {
    left: 0,
    position: "absolute",
    top: 0,
  },
  shareCalendarContent: {
    backgroundColor: appColors.background,
    flex: 1,
  },
});
