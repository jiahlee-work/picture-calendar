import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMonthlyRecapSelection } from "@/application/hooks/useMonthlyRecapSelection";
import { DailyPhotoDetailSheet } from "@/presentation/components/organisms/daily-photo-detail-sheet";
import { MonthlyCalendar } from "@/presentation/components/organisms/monthly-calendar";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

type RecapPhotoSelectionScreenProps = {
  monthKey: string;
};

export function RecapPhotoSelectionScreen(props: RecapPhotoSelectionScreenProps) {
  const { monthKey } = props;
  const router = useRouter();
  const {
    calendar,
    dismissPhotoDetail,
    handleOpenPhotoDetail,
    handleResetSelection,
    handleSaveSelection,
    handleTogglePhotoSelection,
    hasLoadFailed,
    isLoading,
    photoDetail,
    selectedDateKeys,
    selectedPhotoCount,
    selectionLimit,
  } = useMonthlyRecapSelection(monthKey);
  const monthDate = dayjs(`${monthKey}-01`);
  const title = monthDate.isValid() ? monthDate.format("MMMM YYYY") : "Monthly Recap";
  const canSubmitSelection = selectedPhotoCount > 0 && !isLoading && !hasLoadFailed;

  const handleCancelPress = () => {
    dismissPhotoDetail();
    handleResetSelection();

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/recap");
  };

  const handleCompletePress = async () => {
    if (!canSubmitSelection) {
      return;
    }

    try {
      await handleSaveSelection();
      router.replace({
        params: {
          month: monthDate.format("MM"),
          year: monthDate.format("YYYY"),
        },
        pathname: "/recap/[year]/[month]",
      });
    } catch {
      Alert.alert("저장 실패", "대표 사진을 저장하지 못했습니다.");
    }
  };

  const handleSelectDate = (dateKey: string) => {
    const result = handleTogglePhotoSelection(dateKey);

    if (result === "selection_limit_reached") {
      Alert.alert("선택 제한", `대표 사진은 최대 ${selectionLimit}개까지 선택할 수 있습니다.`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.appBar}>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="대표 사진 선택 취소"
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={handleCancelPress}
          >
            <Text style={styles.actionText}>취소</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.statusPanel}>
            <ActivityIndicator color={appColors.black} />
          </View>
        ) : hasLoadFailed ? (
          <View style={styles.statusPanel}>
            <Text style={styles.statusTitle}>사진을 불러오지 못했습니다.</Text>
          </View>
        ) : (
          <MonthlyCalendar
            canSwipeMonth={false}
            calendar={calendar}
            selectedDateKeys={selectedDateKeys}
            onLongPressDate={handleOpenPhotoDetail}
            onSelectDate={handleSelectDate}
          />
        )}
      </View>
      <View style={styles.selectionFooter}>
        <Text style={styles.selectionHint}>최대 10개 선택 가능</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="대표 사진 선택 완료"
          disabled={!canSubmitSelection}
          style={({ pressed }) => [
            styles.completeButton,
            !canSubmitSelection && styles.completeButtonDisabled,
            pressed && canSubmitSelection && styles.completeButtonPressed,
          ]}
          onPress={handleCompletePress}
        >
          <Text style={[styles.completeButtonText, !canSubmitSelection && styles.completeButtonTextDisabled]}>완료</Text>
        </Pressable>
      </View>
      <DailyPhotoDetailSheet
        dateLabel={photoDetail?.dateLabel ?? ""}
        isToday={false}
        photo={photoDetail?.photo ?? null}
        showActions={false}
        visible={Boolean(photoDetail)}
        onChangePhoto={() => undefined}
        onClose={dismissPhotoDetail}
        onDeletePhoto={() => undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: appColors.background,
    flex: 1,
  },
  container: {
    backgroundColor: appColors.background,
    flex: 1,
    paddingTop: 10,
  },
  appBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    color: appColors.black,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: "#eeeeee",
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    minWidth: 58,
    paddingHorizontal: 14,
  },
  actionButtonPressed: {
    opacity: 0.78,
  },
  actionText: {
    color: appColors.black,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  selectionFooter: {
    backgroundColor: appColors.background,
    borderTopColor: "#eeeeee",
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
    paddingBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  selectionHint: {
    color: "#7b7b7b",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    textAlign: "center",
  },
  completeButton: {
    alignItems: "center",
    backgroundColor: appColors.black,
    borderRadius: 20,
    minHeight: 50,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  completeButtonDisabled: {
    backgroundColor: "#d0d0d0",
  },
  completeButtonPressed: {
    opacity: 0.78,
  },
  completeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22,
  },
  completeButtonTextDisabled: {
    color: "#8a8a8a",
  },
  statusPanel: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  statusTitle: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    textAlign: "center",
  },
});
