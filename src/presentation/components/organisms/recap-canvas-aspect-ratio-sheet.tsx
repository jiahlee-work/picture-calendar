import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useEffect, useRef, type ComponentRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText as Text } from "@/presentation/components/atoms/app-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBottomSheetBackdrop } from "@/presentation/components/atoms/app-bottom-sheet-backdrop";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";
import {
  RecapCanvasAspectRatio,
  type RecapCanvasAspectRatio as RecapCanvasAspectRatioType,
} from "@/shared/recap/types";

type RecapCanvasAspectRatioSheetProps = {
  confirmLabel?: string;
  required?: boolean;
  subtitle?: string;
  title?: string;
  value: RecapCanvasAspectRatioType;
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onSelect: (value: RecapCanvasAspectRatioType) => void;
  onClose: () => void;
};

const OPTIONS = [
  {
    description: "화면을 가득 채우는 비율이에요.",
    id: RecapCanvasAspectRatio.device,
    label: "full",
  },
  {
    description: "피드에 올리기 좋은 비율이에요.",
    id: RecapCanvasAspectRatio.portraitFourFive,
    label: "4:5",
  },
  {
    description: "스토리에 올리기 좋은 비율이에요.",
    id: RecapCanvasAspectRatio.portraitNineSixteen,
    label: "9:16",
  },
] as const;

export function RecapCanvasAspectRatioSheet(
  props: RecapCanvasAspectRatioSheetProps,
) {
  const {
    confirmLabel = "완료",
    onClose,
    onCancel,
    onConfirm,
    onSelect,
    required = false,
    subtitle = "리캡의 캔버스 비율을 먼저 선택해 주세요.\n상단의 더보기를 통해 언제든 변경할 수 있어요.",
    title = "캔버스 비율 선택",
    value,
    visible,
  } = props;
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<ComponentRef<typeof BottomSheetModal>>(null);
  const isPresentedRef = useRef(false);

  useEffect(() => {
    if (visible) {
      isPresentedRef.current = true;
      bottomSheetRef.current?.present();
      return;
    }

    if (isPresentedRef.current) {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleDismiss = () => {
    isPresentedRef.current = false;

    if (!required) {
      onClose();
    }
  };

  const handleSelect = (nextValue: RecapCanvasAspectRatioType) => {
    onSelect(nextValue);
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      backdropComponent={required ? RequiredBackdrop : AppBottomSheetBackdrop}
      backgroundStyle={styles.sheetBackground}
      containerStyle={styles.sheetContainer}
      enableDynamicSizing
      enableHandlePanningGesture={!required}
      enablePanDownToClose={!required}
      handleIndicatorStyle={styles.handleIndicator}
      index={0}
      onDismiss={handleDismiss}
    >
      <BottomSheetView
        style={[styles.content, { paddingBottom: Math.max(insets.bottom, 18) }]}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <AspectRatioOption
              key={option.id}
              description={option.description}
              isSelected={option.id === value}
              label={option.label}
              onPress={() => handleSelect(option.id)}
            />
          ))}
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.pressedCancelButton,
            ]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonLabel}>
              {required ? "리캡 목록으로" : "취소"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.confirmButton,
              pressed && styles.pressedConfirmButton,
            ]}
            onPress={onConfirm}
          >
            <Text style={styles.confirmButtonLabel}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

function RequiredBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.35}
      pressBehavior="none"
    />
  );
}

function AspectRatioOption(props: {
  description: string;
  isSelected: boolean;
  label: string;
  onPress: () => void;
}) {
  const { description, isSelected, label, onPress } = props;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      style={({ pressed }) => [
        styles.option,
        isSelected && styles.selectedOption,
        pressed && styles.pressedOption,
      ]}
      onPress={onPress}
    >
      <View style={styles.optionCopy}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <View style={[styles.radio, isSelected && styles.selectedRadio]}>
        {isSelected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    alignItems: "center",
    borderColor: "rgba(18,18,18,0.24)",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 54,
  },
  cancelButtonLabel: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: "900",
  },
  confirmButton: {
    alignItems: "center",
    backgroundColor: appColors.black,
    borderCurve: "continuous",
    borderRadius: 16,
    flex: 1,
    justifyContent: "center",
    minHeight: 54,
  },
  confirmButtonLabel: {
    color: appColors.white,
    fontSize: 16,
    fontWeight: "900",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handleIndicator: {
    backgroundColor: "#dddddd",
    width: 42,
  },
  option: {
    alignItems: "center",
    borderColor: "rgba(18,18,18,0.12)",
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionDescription: {
    color: "rgba(18,18,18,0.58)",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
  },
  optionLabel: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
  },
  options: {
    gap: 10,
    marginTop: 20,
  },
  pressedConfirmButton: {
    opacity: 0.72,
  },
  pressedCancelButton: {
    opacity: 0.62,
  },
  pressedOption: {
    opacity: 0.62,
  },
  radio: {
    alignItems: "center",
    borderColor: "rgba(18,18,18,0.28)",
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  radioDot: {
    backgroundColor: appColors.black,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  selectedOption: {
    backgroundColor: "#F4F4F4",
    borderColor: appColors.black,
  },
  selectedRadio: {
    borderColor: appColors.black,
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
  subtitle: {
    color: "rgba(18,18,18,0.62)",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 21,
    marginTop: 14,
  },
  title: {
    color: appColors.black,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
    textAlign: "center",
  },
});
