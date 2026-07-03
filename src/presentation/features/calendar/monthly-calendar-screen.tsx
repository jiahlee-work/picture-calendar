import { useRef, useState } from "react";
import { Alert, type LayoutChangeEvent, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTodayPhotoFlow } from "@/application/hooks/use-today-photo-flow";
import { addNavigableCalendarMonths, clampCalendarMonth } from "@/application/services/calendar/calendar-month-navigation";
import { DailyPhotoPolicyDialog } from "@/presentation/components/molecules/daily-photo-policy-dialog";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { CalendarWheelPickerSheet } from "@/presentation/components/organisms/calendar-wheel-picker-sheet";
import { DailyPhotoDetailSheet } from "@/presentation/components/organisms/daily-photo-detail-sheet";
import { MonthlyCalendar } from "@/presentation/components/organisms/monthly-calendar";
import { ShareCaptureMenu } from "@/presentation/components/organisms/share-capture-menu";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

type ShareContentLayout = {
  height: number;
  width: number;
};

export function MonthlyCalendarScreen() {
  const shareCaptureRef = useRef<View>(null);
  const [activeMonth, setActiveMonth] = useState(() => clampCalendarMonth(dayjs().startOf("month").toDate()));
  const [isYearMonthPickerVisible, setIsYearMonthPickerVisible] = useState(false);
  const [shareContentLayout, setShareContentLayout] = useState<ShareContentLayout | null>(null);
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
  const isShareReady = calendar.days.length > 0;
  const shareFileName = dayjs(activeMonth).format("YYYY-MM");
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
      if (currentLayout?.height === nextLayout.height && currentLayout.width === nextLayout.width) {
        return currentLayout;
      }

      return nextLayout;
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container} onLayout={handleContainerLayout}>
        <AppBar>
          <AppBar.Title accessibilityLabel="연월 선택 열기" onPress={handleOpenYearMonthPicker}>
            {calendar.title}
          </AppBar.Title>
          <View style={styles.appBarActions}>
            <ShareCaptureMenu
              accessibilityLabel="캘린더 공유 메뉴 열기"
              captureRef={shareCaptureRef}
              fileName={shareFileName}
              isReady={isShareReady && Boolean(shareContentLayout)}
            />
            <AppBar.Menu />
          </View>
        </AppBar>

        <MonthlyCalendar
          calendar={calendar}
          onNextMonth={handleNextMonth}
          onPreviousMonth={handlePreviousMonth}
          onSelectDate={handleSelectDate}
        />
      </View>
      {shareContentLayout ? (
        <View
          ref={shareCaptureRef}
          collapsable={false}
          pointerEvents="none"
          renderToHardwareTextureAndroid
          style={[
            styles.shareCaptureCanvas,
            {
              height: shareContentLayout.height,
              transform: [{ translateX: -(shareContentLayout.width + 120) }],
              width: shareContentLayout.width,
            },
          ]}
        >
          <View style={styles.shareCalendarContent}>
            <AppBar>
              <AppBar.Title>{calendar.title}</AppBar.Title>
            </AppBar>
            <MonthlyCalendar
              calendar={calendar}
              canSwipeMonth={false}
              contentWidth={shareContentLayout.width}
              onSelectDate={() => {}}
            />
          </View>
        </View>
      ) : null}
      <DailyPhotoPolicyDialog
        dialog={policyDialog}
        onCancel={dismissDialog}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  container: {
    flex: 1,
    backgroundColor: appColors.background,
    paddingTop: 10,
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
