import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { addMonths } from "@/application/services/calendar/calendar-grid";
import { useTodayPhotoFlow } from "@/application/hooks/use-today-photo-flow";
import { DailyPhotoPolicyDialog } from "@/presentation/components/molecules/daily-photo-policy-dialog";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { AppMenuButton } from "@/presentation/components/organisms/app-menu-button";
import { CalendarMonthPickerSheet } from "@/presentation/components/organisms/calendar-month-picker-sheet";
import { DailyPhotoDetailSheet } from "@/presentation/components/organisms/daily-photo-detail-sheet";
import { MonthlyCalendar } from "@/presentation/components/organisms/monthly-calendar";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

export function MonthlyCalendarScreen() {
  const [activeMonth, setActiveMonth] = useState(() => dayjs().startOf("month").toDate());
  const [isDecorating, setIsDecorating] = useState(false);
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
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
    setActiveMonth((current) => addMonths(current, -1));
  };
  const handleNextMonth = () => {
    setActiveMonth((current) => addMonths(current, 1));
  };
  const handleToggleDecorating = () => {
    setIsDecorating((current) => !current);
  };
  const handleOpenMonthPicker = () => {
    setIsMonthPickerVisible(true);
  };
  const handleCloseMonthPicker = () => {
    setIsMonthPickerVisible(false);
  };
  const handleConfirmMonth = (date: Date) => {
    setActiveMonth(date);
    setIsMonthPickerVisible(false);
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
        <AppBar style={styles.appBar}>
          <AppBar.Title accessibilityLabel="연월 선택 열기" onPress={handleOpenMonthPicker}>
            {calendar.title}
          </AppBar.Title>
          <AppMenuButton
            decorationLabel={isDecorating ? "꾸미기 종료" : "꾸미기"}
            onToggleDecorating={handleToggleDecorating}
          />
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
      <CalendarMonthPickerSheet
        value={activeMonth}
        visible={isMonthPickerVisible}
        onClose={handleCloseMonthPicker}
        onConfirm={handleConfirmMonth}
      />
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
  appBar: {
    marginBottom: 12,
  },
});
