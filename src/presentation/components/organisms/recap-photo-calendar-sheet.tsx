import BottomSheet, {
  BottomSheetView,
  useBottomSheet,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import { useMemo } from "react";
import {
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
    [calendar.days, multiple, onChangeSelectedPhotoIds, selectedPhotoIds],
  );
  if (!visible) {
    return null;
  }

  return (
    <BottomSheet
      backgroundComponent={PhotoCalendarSheetBackground}
      backdropComponent={PhotoCalendarSheetBackdrop}
      containerStyle={styles.sheetContainer}
      enableDynamicSizing={false}
      enablePanDownToClose
      handleComponent={PhotoCalendarSheetHandle}
      index={0}
      snapPoints={snapPoints}
      onChange={(nextIndex) => nextIndex === -1 && onClose()}
      onClose={onClose}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{calendar.monthName}</Text>
          <Text style={styles.year}>{calendar.year}</Text>
          <Pressable
            accessibilityState={{ disabled: selectedPhotoIds.length === 0 }}
            accessibilityRole="button"
            accessibilityLabel="사진 선택 완료"
            style={({ pressed }) => [
              styles.completeButton,
              selectedPhotoIds.length === 0 && styles.completeButtonDisabled,
              pressed && styles.completeButtonPressed,
            ]}
            disabled={selectedPhotoIds.length === 0}
            onPress={onComplete ?? onClose}
          >
            <Text style={styles.completeButtonText}>완료</Text>
          </Pressable>
        </View>
        <View style={styles.calendarContainer}>
          <MonthlyCalendar
            calendar={calendar}
            canSwipeMonth={false}
            contentWidth={width - appSpacing.screenHorizontalPadding * 2}
            selectionCheckboxByDateKey={selectionCheckboxByDateKey}
            onSelectDate={(dateKey) => {
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
  calendarGrid: {
    backgroundColor: appColors.background,
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    overflow: "hidden",
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
  dayBadge: {
    backgroundColor: "rgba(18,18,18,0.72)",
    borderRadius: 10,
    left: "50%",
    minWidth: 30,
    paddingHorizontal: 5,
    paddingVertical: 2,
    position: "absolute",
    top: 4,
    transform: [{ translateX: -15 }],
  },
  dayBadgeText: {
    color: appColors.white,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 14,
    textAlign: "center",
  },
  dayCell: {
    backgroundColor: appColors.background,
    borderColor: "#eeeeee",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: "16.6667%",
    overflow: "hidden",
    position: "relative",
    width: "14.2857%",
  },
  dayText: {
    color: appColors.black,
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 20,
    left: 0,
    position: "absolute",
    right: 0,
    textAlign: "center",
    top: 9,
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
  photo: {
    bottom: 0,
    height: "100%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
    zIndex: 1,
  },
  photoCell: {
    overflow: "hidden",
  },
  photoCellPressed: {
    opacity: 0.65,
  },
  selectionControl: {
    bottom: 4,
    left: "50%",
    position: "absolute",
    transform: [{ translateX: -12 }],
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
  weekday: {
    backgroundColor: appColors.background,
    color: "#9a9a9a",
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    paddingBottom: 12,
    paddingTop: 8,
    textAlign: "center",
  },
  weekdayRow: {
    borderBottomColor: "#eeeeee",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 2,
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

function PhotoCalendarSheetBackdrop() {
  const { close } = useBottomSheet();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="사진 선택창 닫기"
      style={StyleSheet.absoluteFill}
      onPress={() => close()}
    />
  );
}

function PhotoCalendarSheetHandle() {
  return <View style={styles.handleIndicator} />;
}
