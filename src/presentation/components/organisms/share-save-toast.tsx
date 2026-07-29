import { useEffect } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import {
  ShareSaveToastState,
  toShareSaveToastMessage,
  type ShareSaveToastState as ShareSaveToastStateType,
} from "@/presentation/helpers/sharing/share-save-toast-message";
import { appColors } from "@/presentation/theme/colors";

type ShareSaveToastProps = {
  state: ShareSaveToastStateType;
  onDone: () => void;
};

export function ShareSaveToast(props: ShareSaveToastProps) {
  const { onDone, state } = props;
  const isVisible = state !== ShareSaveToastState.hidden;
  const isSaving = state === ShareSaveToastState.saving;

  useEffect(() => {
    if (
      state !== ShareSaveToastState.saved &&
      state !== ShareSaveToastState.failed
    ) {
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
        {isSaving && <View style={styles.dim} />}
        <View style={styles.toast}>
          {state === ShareSaveToastState.saving && (
            <ActivityIndicator color={appColors.white} size="small" />
          )}
          {state === ShareSaveToastState.saved && (
            <ReiconIcon color={appColors.white} name="CheckCircle" size={22} />
          )}
          {state === ShareSaveToastState.failed && (
            <ReiconIcon color={appColors.white} name="CloseCircle" size={22} />
          )}
          <Text style={styles.toastText}>{toShareSaveToastMessage(state)}</Text>
        </View>
      </View>
    </Modal>
  );
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
