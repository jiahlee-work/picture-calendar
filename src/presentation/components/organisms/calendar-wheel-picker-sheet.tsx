import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  createCalendarMonthOptions,
  createCalendarYearOptions,
  createNavigableCalendarMonth,
} from "@/application/services/calendar/calendar-month-navigation";
import { AppBottomSheetBackdrop } from "@/presentation/components/atoms/app-bottom-sheet-backdrop";
import {
  WheelPickerColumn,
  WHEEL_PICKER_HEIGHT,
  WHEEL_PICKER_ITEM_HEIGHT,
  WHEEL_PICKER_SPACER_HEIGHT,
} from "@/presentation/components/molecules/wheel-picker-column";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

type CalendarWheelPickerSheetProps = {
  value: Date;
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

export function CalendarWheelPickerSheet(props: CalendarWheelPickerSheetProps) {
  const { onClose, onConfirm, value, visible } = props;
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const valueMonth = dayjs(value).startOf("month");
  const valueYear = valueMonth.year();
  const valueMonthIndex = valueMonth.month();
  const [selectedYear, setSelectedYear] = useState(valueYear);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(valueMonthIndex);
  const snapPoints = useMemo(() => ["46%"], []);
  const yearOptions = useMemo(() => {
    return createCalendarYearOptions(value).map((year) => ({
      label: `${year}년`,
      value: year,
    }));
  }, [value]);
  const monthOptions = useMemo(() => {
    return createCalendarMonthOptions(selectedYear).map((month) => ({
      label: month.label,
      value: month.monthIndex,
    }));
  }, [selectedYear]);
  const selectedMonthOption = monthOptions.find((month) => month.value === selectedMonthIndex) ?? monthOptions[0];

  useEffect(() => {
    setSelectedYear(valueYear);
    setSelectedMonthIndex(valueMonthIndex);
  }, [valueMonthIndex, valueYear]);

  useEffect(() => {
    if (!selectedMonthOption || selectedMonthOption.value === selectedMonthIndex) {
      return;
    }

    setSelectedMonthIndex(selectedMonthOption.value);
  }, [selectedMonthIndex, selectedMonthOption]);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
      return;
    }

    bottomSheetRef.current?.dismiss();
  }, [visible]);

  const handleCancel = () => {
    bottomSheetRef.current?.dismiss();
  };

  const handleConfirm = () => {
    onConfirm(createNavigableCalendarMonth(selectedYear, selectedMonthOption?.value ?? selectedMonthIndex));
    bottomSheetRef.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      backdropComponent={AppBottomSheetBackdrop}
      backgroundStyle={styles.sheetBackground}
      enableDynamicSizing={false}
      enablePanDownToClose
      handleIndicatorStyle={styles.handleIndicator}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.pickerFrame}>
          <View pointerEvents="none" style={styles.selectionIndicator} />
          <View style={styles.pickerRow}>
            <WheelPickerColumn
              options={yearOptions}
              selectedValue={selectedYear}
              onValueChange={setSelectedYear}
            />
            <WheelPickerColumn
              options={monthOptions}
              selectedValue={selectedMonthOption?.value ?? selectedMonthIndex}
              onValueChange={setSelectedMonthIndex}
            />
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" style={[styles.actionButton, styles.cancelButton]} onPress={handleCancel}>
            <Text style={[styles.actionText, styles.cancelText]}>취소</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={[styles.actionButton, styles.confirmButton]} onPress={handleConfirm}>
            <Text style={[styles.actionText, styles.confirmText]}>확인</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: "#dddddd",
    width: 42,
  },
  content: {
    flex: 1,
    gap: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  pickerFrame: {
    height: WHEEL_PICKER_HEIGHT,
    position: "relative",
  },
  pickerRow: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  selectionIndicator: {
    backgroundColor: "#f4f4f5",
    borderRadius: 12,
    height: WHEEL_PICKER_ITEM_HEIGHT,
    left: 0,
    position: "absolute",
    right: 0,
    top: WHEEL_PICKER_SPACER_HEIGHT,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    minHeight: 56,
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#ffffff",
    borderColor: "#eeeeee",
    borderWidth: StyleSheet.hairlineWidth,
  },
  confirmButton: {
    backgroundColor: appColors.black,
  },
  actionText: {
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },
  cancelText: {
    color: appColors.black,
  },
  confirmText: {
    color: appColors.white,
  },
});
