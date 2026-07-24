import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";

import { AppBottomSheetBackdrop } from "@/presentation/components/atoms/app-bottom-sheet-backdrop";
import { CalendarWheelPickerSelector } from "@/presentation/components/organisms/calendar-wheel-picker-selector";
import { appLayers } from "@/presentation/theme/layers";

type CalendarWheelPickerSheetProps = {
  value: Date;
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

export function CalendarWheelPickerSheet(props: CalendarWheelPickerSheetProps) {
  const { onClose, onConfirm, value, visible } = props;
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["46%"], []);

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

  const handleConfirm = (date: Date) => {
    onConfirm(date);
    bottomSheetRef.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      backdropComponent={AppBottomSheetBackdrop}
      backgroundStyle={styles.sheetBackground}
      containerStyle={styles.sheetContainer}
      enableDynamicSizing={false}
      enablePanDownToClose
      handleIndicatorStyle={styles.handleIndicator}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
    >
      <BottomSheetView>
        <CalendarWheelPickerSelector
          value={value}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: "#dddddd",
    width: 42,
  },
  sheetContainer: {
    elevation: appLayers.bottomSheet,
    zIndex: appLayers.bottomSheet,
  },
  sheetBackground: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
