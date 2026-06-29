import { useEffect } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { SymbolView, type SymbolViewProps } from "expo-symbols";

import { appColors } from "@/presentation/theme/colors";

export const ShareSaveToastState = {
  failed: "failed",
  hidden: "hidden",
  saved: "saved",
  saving: "saving",
} as const;

export type ShareSaveToastState = (typeof ShareSaveToastState)[keyof typeof ShareSaveToastState];

type ShareSaveToastProps = {
  state: ShareSaveToastState;
  onDone: () => void;
};

const DONE_ICON: SymbolViewProps["name"] = { android: "check_circle", ios: "checkmark.circle.fill" };
const FAILED_ICON: SymbolViewProps["name"] = { android: "error", ios: "xmark.circle.fill" };

export function ShareSaveToast(props: ShareSaveToastProps) {
  const { onDone, state } = props;
  const isVisible = state !== ShareSaveToastState.hidden;
  const isSaving = state === ShareSaveToastState.saving;

  useEffect(() => {
    if (state !== ShareSaveToastState.saved && state !== ShareSaveToastState.failed) {
      return;
    }

    const timer = setTimeout(onDone, 1800);

    return () => {
      clearTimeout(timer);
    };
  }, [onDone, state]);

  if (!isVisible) {
    return null;
  }

  return (
    <Modal transparent visible onRequestClose={isSaving ? () => {} : onDone}>
      <View pointerEvents={isSaving ? "auto" : "box-none"} style={styles.root}>
        {isSaving ? <View style={styles.dim} /> : null}
        <View style={styles.toast}>
          {state === ShareSaveToastState.saving ? <ActivityIndicator color={appColors.white} size="small" /> : null}
          {state === ShareSaveToastState.saved ? <ToastIcon icon={DONE_ICON} /> : null}
          {state === ShareSaveToastState.failed ? <ToastIcon icon={FAILED_ICON} /> : null}
          <Text style={styles.toastText}>{toToastMessage(state)}</Text>
        </View>
      </View>
    </Modal>
  );
}

function ToastIcon({ icon }: { icon: SymbolViewProps["name"] }) {
  return (
    <SymbolView
      colors={[appColors.white]}
      name={icon}
      size={22}
      tintColor={appColors.white}
      type="monochrome"
      weight="bold"
    />
  );
}

function toToastMessage(state: ShareSaveToastState) {
  if (state === ShareSaveToastState.saving) {
    return "저장 중";
  }

  if (state === ShareSaveToastState.saved) {
    return "이미지를 갤러리에 저장했어요.";
  }

  if (state === ShareSaveToastState.failed) {
    return "이미지를 저장하지 못했어요.";
  }

  return "";
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  dim: {
    backgroundColor: appColors.blackOverlay26,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  toast: {
    alignItems: "center",
    backgroundColor: "rgba(18, 18, 18, 0.88)",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    maxWidth: "100%",
    minHeight: 54,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  toastText: {
    color: appColors.white,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
  },
});
