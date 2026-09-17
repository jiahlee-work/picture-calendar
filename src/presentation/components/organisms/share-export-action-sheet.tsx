import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useRef, type ComponentRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBottomSheetBackdrop } from "@/presentation/components/atoms/app-bottom-sheet-backdrop";
import { AppText as Text } from "@/presentation/components/atoms/app-text";
import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";

type ShareExportActionSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  onShare: () => void;
};

export function ShareExportActionSheet(props: ShareExportActionSheetProps) {
  const { onClose, onSave, onShare, visible } = props;
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
    onClose();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      backdropComponent={AppBottomSheetBackdrop}
      backgroundStyle={styles.sheetBackground}
      containerStyle={styles.sheetContainer}
      enableDynamicSizing
      handleIndicatorStyle={styles.handleIndicator}
      index={0}
      onDismiss={handleDismiss}
    >
      <BottomSheetView
        style={[styles.content, { paddingBottom: Math.max(insets.bottom, 18) }]}
      >
        <Text style={styles.title}>내보내기</Text>
        <View style={styles.actions}>
          <ExportAction icon="Download" label="이미지 저장" onPress={onSave} />
          <ExportAction icon="Share" label="공유하기" onPress={onShare} />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

function ExportAction(props: {
  icon: "Download" | "Share";
  label: string;
  onPress: () => void;
}) {
  const { icon, label, onPress } = props;

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.action, pressed && styles.pressedAction]}
      onPress={onPress}
    >
      <ReiconIcon color={appColors.black} name={icon} size={22} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderColor: "rgba(18,18,18,0.12)",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 18,
  },
  actionLabel: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: "400",
  },
  actions: {
    gap: 10,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handleIndicator: {
    backgroundColor: "#dddddd",
    width: 42,
  },
  pressedAction: {
    backgroundColor: "#F4F4F4",
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
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
    textAlign: "center",
  },
});
