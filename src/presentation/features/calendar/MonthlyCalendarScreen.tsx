import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { addMonths } from "@/application/services/calendar/calendar-grid";
import { useTodayPhotoFlow } from "@/application/hooks/useTodayPhotoFlow";
import { DailyPhotoDialog } from "@/presentation/components/molecules/daily-photo-dialog";
import { AppMenuButton } from "@/presentation/components/organisms/app-menu-button";
import { MonthlyCalendar } from "@/presentation/components/organisms/monthly-calendar";
import { dayjs } from "@/shared/date/dayjs";

export function MonthlyCalendarScreen() {
  const [activeMonth, setActiveMonth] = useState(() => dayjs().startOf("month").toDate());
  const [isDecorating, setIsDecorating] = useState(false);
  const { calendar, dialog, dismissDialog, handleSelectDate } = useTodayPhotoFlow(activeMonth);
  const handlePreviousMonth = () => {
    setActiveMonth((current) => addMonths(current, -1));
  };
  const handleNextMonth = () => {
    setActiveMonth((current) => addMonths(current, 1));
  };
  const handleToggleDecorating = () => {
    setIsDecorating((current) => !current);
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
      <DailyPhotoDialog
        dialog={dialog}
        onCancel={dismissDialog}
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
