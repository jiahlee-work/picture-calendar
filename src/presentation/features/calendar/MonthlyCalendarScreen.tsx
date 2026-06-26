import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { addMonths } from "@/application/services/calendar/calendar-grid";
import { useTodayPhotoFlow } from "@/application/hooks/useTodayPhotoFlow";
import { DailyPhotoPolicyDialog } from "@/presentation/components/molecules/daily-photo-policy-dialog";
import { AppMenuButton } from "@/presentation/components/organisms/app-menu-button";
import { DailyPhotoDetailSheet } from "@/presentation/components/organisms/daily-photo-detail-sheet";
import { MonthlyCalendar } from "@/presentation/components/organisms/monthly-calendar";
import { dayjs } from "@/shared/date/dayjs";

export function MonthlyCalendarScreen() {
  const [activeMonth, setActiveMonth] = useState(() => dayjs().startOf("month").toDate());
  const [isDecorating, setIsDecorating] = useState(false);
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
        <View style={styles.appBar}>
          <Text style={styles.appTitle}>{calendar.title}</Text>
          <AppMenuButton
            decorationLabel={isDecorating ? "꾸미기 종료" : "꾸미기"}
            onToggleDecorating={handleToggleDecorating}
          />
        </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 10,
  },
  appBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    minHeight: 52,
    paddingHorizontal: 20,
  },
  appTitle: {
    color: "#202020",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "left",
  },
});
