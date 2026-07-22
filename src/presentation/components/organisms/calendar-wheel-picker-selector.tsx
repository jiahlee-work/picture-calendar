import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  createCalendarMonthOptions,
  createCalendarYearOptions,
  createNavigableCalendarMonth,
} from "@/application/services/calendar/calendar-month-navigation";
import {
  WheelPickerColumn,
  WHEEL_PICKER_HEIGHT,
  WHEEL_PICKER_ITEM_HEIGHT,
  WHEEL_PICKER_SPACER_HEIGHT,
} from "@/presentation/components/molecules/wheel-picker-column";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

type CalendarWheelPickerSelectorProps = {
  value: Date;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
};

export function CalendarWheelPickerSelector(
  props: CalendarWheelPickerSelectorProps,
) {
  const { onCancel, onConfirm, value } = props;
  const valueMonth = dayjs(value).startOf("month");
  const valueYear = valueMonth.year();
  const valueMonthIndex = valueMonth.month();
  const [selectedYear, setSelectedYear] = useState(valueYear);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(valueMonthIndex);
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
  const selectedMonthOption =
    monthOptions.find((month) => month.value === selectedMonthIndex) ??
    monthOptions[0];

  const handleConfirm = () => {
    onConfirm(
      createNavigableCalendarMonth(
        selectedYear,
        selectedMonthOption?.value ?? selectedMonthIndex,
      ),
    );
  };

  return (
    <View style={styles.content}>
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
        <Pressable
          accessibilityRole="button"
          style={[styles.actionButton, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={[styles.actionText, styles.cancelText]}>취소</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={[styles.actionButton, styles.confirmButton]}
          onPress={handleConfirm}
        >
          <Text style={[styles.actionText, styles.confirmText]}>확인</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    minHeight: 56,
    justifyContent: "center",
  },
  actionText: {
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "#ffffff",
    borderColor: "#eeeeee",
    borderWidth: StyleSheet.hairlineWidth,
  },
  cancelText: {
    color: appColors.black,
  },
  confirmButton: {
    backgroundColor: appColors.black,
  },
  confirmText: {
    color: appColors.white,
  },
  content: {
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
    flexDirection: "row",
    gap: 8,
    height: "100%",
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
});
