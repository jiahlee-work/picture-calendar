import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTodayPhotoFlow } from "@/application/hooks/use-today-photo-flow";
import { addNavigableCalendarMonths, clampCalendarMonth } from "@/application/services/calendar/calendar-month-navigation";
import { DailyPhotoPolicyDialog } from "@/presentation/components/molecules/daily-photo-policy-dialog";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { CalendarWheelPickerSheet } from "@/presentation/components/organisms/calendar-wheel-picker-sheet";
import { DailyPhotoDetailSheet } from "@/presentation/components/organisms/daily-photo-detail-sheet";
import { MonthlyCalendar } from "@/presentation/components/organisms/monthly-calendar";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

export function MonthlyCalendarScreen() {
  const [activeMonth, setActiveMonth] = useState(() => clampCalendarMonth(dayjs().startOf("month").toDate()));
  const [isYearMonthPickerVisible, setIsYearMonthPickerVisible] = useState(false);
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
      <View style={styles.container}>
        <AppBar>
          <AppBar.Title accessibilityLabel="연월 선택 열기" onPress={handleOpenYearMonthPicker}>
            {calendar.title}
          </AppBar.Title>
          <AppBar.Menu />
        </AppBar>

        <MonthlyCalendar
          calendar={calendar}
          onNextMonth={handleNextMonth}
          onPreviousMonth={handlePreviousMonth}
          onSelectDate={handleSelectDate}
        />
      </View>
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
});
