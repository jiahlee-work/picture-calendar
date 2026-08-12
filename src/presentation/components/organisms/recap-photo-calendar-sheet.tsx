import BottomSheet, {
  BottomSheetView,
  useBottomSheet,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { MonthlyCalendar } from "@/presentation/components/organisms/monthly-calendar";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";
import { appSpacing } from "@/presentation/theme/spacing";
import { dayjs } from "@/shared/date/dayjs";

type RecapPhotoCalendarSheetProps = {
  isCompleting?: boolean;
  monthKey: string;
  multiple?: boolean;
  photos: DailyPhoto[];
  selectedPhotoIds: string[];
  visible: boolean;
  onClose: () => void;
  onChangeSelectedPhotoIds: (photoIds: string[]) => void;
  onComplete?: () => void;
};

export function RecapPhotoCalendarSheet(props: RecapPhotoCalendarSheetProps) {
  const {
    isCompleting = false,
    monthKey,
    multiple = false,
    onClose,
    onChangeSelectedPhotoIds,
    onComplete,
    photos,
    selectedPhotoIds,
    visible,
  } = props;
  const { width } = useWindowDimensions();
  const calendar = useMemo(() => {
    const photosByDate = Object.fromEntries(
      photos.map((photo) => [photo.date, photo]),
    );

    return buildCalendarMonth(
      dayjs(`${monthKey}-01`).toDate(),
      dayjs().toDate(),
      photosByDate,
    );
  }, [monthKey, photos]);
  const snapPoints = useMemo(() => ["90%"], []);
  const isCompleteDisabled = selectedPhotoIds.length === 0 || isCompleting;
  const selectionCheckboxByDateKey = useMemo(
    () =>
      Object.fromEntries(
        calendar.days.flatMap((day) => {
          const photo = day?.photo;
          if (!day || !photo) return [];
          return [
            [
              day.key,
              {
                accessibilityLabel: `${day.dayOfMonth}일 사진 선택`,
                isSelected: selectedPhotoIds.includes(photo.id),
                onPress: () => {
                  if (isCompleting) {
                    return;
                  }

                  const nextPhotoIds = selectedPhotoIds.includes(photo.id)
                    ? selectedPhotoIds.filter((id) => id !== photo.id)
                    : multiple
                      ? [...selectedPhotoIds, photo.id]
                      : [photo.id];
                  onChangeSelectedPhotoIds(nextPhotoIds);
                },
              },
            ],
          ];
        }),
      ),
    [
      calendar.days,
      isCompleting,
      multiple,
      onChangeSelectedPhotoIds,
      selectedPhotoIds,
    ],
  );
  if (!visible) {
    return null;
  }

  return (
    <BottomSheet
      accessible={false}
      backgroundComponent={PhotoCalendarSheetBackground}
      backdropComponent={(backdropProps) => (
        <PhotoCalendarSheetBackdrop
          {...backdropProps}
          disabled={isCompleting}
        />
      )}
      containerStyle={styles.sheetContainer}
      enableDynamicSizing={false}
      enablePanDownToClose={!isCompleting}
      handleComponent={PhotoCalendarSheetHandle}
      index={0}
      snapPoints={snapPoints}
      onClose={onClose}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{calendar.monthName}</Text>
          <Text style={styles.year}>{calendar.year}</Text>
          <Pressable
            accessibilityState={{
              busy: isCompleting,
              disabled: isCompleteDisabled,
            }}
            accessibilityRole="button"
            accessibilityLabel={
              isCompleting ? "사진 추가 중" : "사진 선택 완료"
            }
            style={({ pressed }) => [
              styles.completeButton,
              isCompleteDisabled && styles.completeButtonDisabled,
              pressed && !isCompleteDisabled && styles.completeButtonPressed,
            ]}
            disabled={isCompleteDisabled}
            onPress={onComplete ?? onClose}
          >
            {isCompleting ? (
              <ActivityIndicator color={appColors.white} size="small" />
            ) : (
              <Text style={styles.completeButtonText}>완료</Text>
            )}
          </Pressable>
        </View>
        <View style={styles.calendarContainer}>
          <MonthlyCalendar
            calendar={calendar}
            canSwipeMonth={false}
            contentWidth={width - appSpacing.screenHorizontalPadding * 2}
            selectionCheckboxByDateKey={selectionCheckboxByDateKey}
            onSelectDate={(dateKey) => {
              if (isCompleting) {
                return;
              }

              selectionCheckboxByDateKey[dateKey]?.onPress();
            }}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    flex: 1,
  },
  content: {
    gap: 18,
    flex: 1,
    height: "100%",
    paddingBottom: 24,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
  },
  completeButton: {
    backgroundColor: appColors.black,
    borderRadius: 18,
    marginLeft: "auto",
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  completeButtonPressed: {
    opacity: 0.5,
  },
  completeButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  completeButtonText: {
    color: appColors.white,
    fontSize: 16,
    fontWeight: "400",
  },
  header: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 8,
  },
  handleIndicator: {
    backgroundColor: "#dddddd",
    borderRadius: 2,
    height: 4,
    marginBottom: 12,
    marginTop: 16,
    alignSelf: "center",
    width: 42,
  },
  sheetBackground: {
    backgroundColor: appColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContainer: {
    elevation: appLayers.bottomSheet,
    zIndex: appLayers.bottomSheet,
  },
  title: {
    color: appColors.black,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  year: {
    color: appColors.blackOverlay34,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 20,
  },
});

function PhotoCalendarSheetBackground(props: BottomSheetBackgroundProps) {
  return (
    <View
      pointerEvents={props.pointerEvents}
      style={[props.style, styles.sheetBackground]}
    />
  );
}

function PhotoCalendarSheetBackdrop(
  props: BottomSheetBackdropProps & { disabled: boolean },
) {
  const { close } = useBottomSheet();
  const { disabled, style } = props;

  return (
    <Pressable
      accessibilityLabel="사진 선택창 닫기"
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={[StyleSheet.absoluteFill, style]}
      onPress={() => close()}
    />
  );
}

function PhotoCalendarSheetHandle() {
  return <View style={styles.handleIndicator} />;
}
