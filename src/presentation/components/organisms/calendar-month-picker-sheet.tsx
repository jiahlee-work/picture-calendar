import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

type CalendarMonthPickerSheetProps = {
  value: Date;
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

export function CalendarMonthPickerSheet(props: CalendarMonthPickerSheetProps) {
  const { onClose, onConfirm, value, visible } = props;
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const valueMonth = dayjs(value).startOf("month");
  const valueYear = valueMonth.year();
  const valueMonthIndex = valueMonth.month();
  const [selectedYear, setSelectedYear] = useState(valueYear);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(valueMonthIndex);
  const snapPoints = useMemo(() => ["42%"], []);
  const yearOptions = useMemo(() => toYearOptions(valueYear), [valueYear]);
  const monthOptions = useMemo(() => toMonthOptions(), []);
  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.35}
        pressBehavior="close"
      />
    ),
    [],
  );

  useEffect(() => {
    setSelectedYear(valueYear);
    setSelectedMonthIndex(valueMonthIndex);
  }, [valueMonthIndex, valueYear]);

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
    onConfirm(dayjs(value).year(selectedYear).month(selectedMonthIndex).startOf("month").toDate());
    bottomSheetRef.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      enableDynamicSizing={false}
      enablePanDownToClose
      handleIndicatorStyle={styles.handleIndicator}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.pickerRow}>
          <ScrollView contentContainerStyle={styles.optionList} showsVerticalScrollIndicator={false} style={styles.optionColumn}>
            {yearOptions.map((year) => (
              <Pressable
                key={year}
                accessibilityRole="button"
                accessibilityState={{ selected: year === selectedYear }}
                style={[styles.option, year === selectedYear && styles.selectedOption]}
                onPress={() => setSelectedYear(year)}
              >
                <Text style={[styles.optionText, year === selectedYear && styles.selectedOptionText]}>{year}년</Text>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView contentContainerStyle={styles.optionList} showsVerticalScrollIndicator={false} style={styles.optionColumn}>
            {monthOptions.map((month) => (
              <Pressable
                key={month.monthIndex}
                accessibilityRole="button"
                accessibilityState={{ selected: month.monthIndex === selectedMonthIndex }}
                style={[styles.option, month.monthIndex === selectedMonthIndex && styles.selectedOption]}
                onPress={() => setSelectedMonthIndex(month.monthIndex)}
              >
                <Text style={[styles.optionText, month.monthIndex === selectedMonthIndex && styles.selectedOptionText]}>
                  {month.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
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

function toYearOptions(centerYear: number): number[] {
  return Array.from({ length: 11 }, (_, index) => centerYear - 5 + index);
}

function toMonthOptions(): Array<{ label: string; monthIndex: number }> {
  return Array.from({ length: 12 }, (_, index) => ({
    label: `${index + 1}월`,
    monthIndex: index,
  }));
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
    gap: 18,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  pickerRow: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  optionList: {
    gap: 8,
    paddingVertical: 8,
  },
  optionColumn: {
    flex: 1,
  },
  option: {
    alignItems: "center",
    borderRadius: 12,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  selectedOption: {
    backgroundColor: "#f2f2f2",
  },
  optionText: {
    color: "#9a9a9a",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 30,
  },
  selectedOptionText: {
    color: appColors.black,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 36,
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
