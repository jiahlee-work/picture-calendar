import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  MonthlyRecapSelectionResult,
  useMonthlyRecapSelection,
} from "@/application/hooks/use-monthly-recap-selection";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { DailyPhotoDetailSheet } from "@/presentation/components/organisms/daily-photo-detail-sheet";
import { MonthlyCalendar } from "@/presentation/components/organisms/monthly-calendar";
import { appColors } from "@/presentation/theme/colors";
import { appSpacing } from "@/presentation/theme/spacing";
import { dayjs } from "@/shared/date/dayjs";

type RecapPhotoSelectionScreenProps = {
  monthKey: string;
};

export function RecapPhotoSelectionScreen(
  props: RecapPhotoSelectionScreenProps,
) {
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
  const title = monthDate.isValid()
    ? monthDate.format("MMMM YYYY")
    : "Monthly Recap";
  const canSubmitSelection =
    selectedPhotoCount > 0 && !isLoading && !hasLoadFailed;

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

    if (result === MonthlyRecapSelectionResult.selectionLimitReached) {
      Alert.alert(
        "선택 제한",
        `대표 사진은 최대 ${selectionLimit}개까지 선택할 수 있습니다.`,
      );
    }
  };

  return (
    <AppSafeAreaView>
      <View style={styles.container}>
        <AppBar>
          <AppBar.Title variant="small">{title}</AppBar.Title>
          <AppBar.Action
            accessibilityLabel="대표 사진 선택 취소"
            label="취소"
            onPress={handleCancelPress}
          />
        </AppBar>

        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.statusPanel}>
              <ActivityIndicator color={appColors.black} />
            </View>
          ) : hasLoadFailed ? (
            <View style={styles.statusPanel}>
              <Text style={styles.statusTitle}>
                사진을 불러오지 못했습니다.
              </Text>
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
      </View>
      <View style={styles.selectionFooter}>
        <Text style={styles.selectionHint}>
          최대 {selectionLimit}개 선택 가능
        </Text>
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
          <Text
            style={[
              styles.completeButtonText,
              !canSubmitSelection && styles.completeButtonTextDisabled,
            ]}
          >
            완료
          </Text>
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
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appColors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: appSpacing.screenContentTopPadding,
  },
  selectionFooter: {
    backgroundColor: appColors.background,
    borderTopColor: "#eeeeee",
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
    paddingBottom: 18,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
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
    paddingHorizontal: appSpacing.screenHorizontalPadding,
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
    paddingHorizontal: appSpacing.screenHorizontalPadding,
  },
  statusTitle: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    textAlign: "center",
  },
});
