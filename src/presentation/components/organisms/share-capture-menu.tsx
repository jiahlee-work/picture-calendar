import {
  forwardRef,
  useImperativeHandle,
  useState,
  type RefObject,
} from "react";
import { Alert, StyleSheet, View } from "react-native";

import {
  SaveCapturedImageResult,
  ShareCapturedImageResult,
  useShareCapture,
} from "@/application/hooks/use-share-capture";
import { openDeviceAppSettings } from "@/application/services/device/open-device-app-settings";
import { translate } from "@/application/services/localization/app-i18n";
import { runtimePlatform } from "@/infrastructure/device/runtime-platform";
import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import { SymbolIconButton } from "@/presentation/components/atoms/symbol-icon-button";
import { NativeActionMenu } from "@/presentation/components/molecules/native-action-menu";
import type { NativeActionMenuAction } from "@/presentation/components/molecules/native-action-menu.types";
import { MediaLibraryPermissionAlert } from "@/presentation/components/organisms/media-library-permission-alert";
import { ShareSaveToast } from "@/presentation/components/organisms/share-save-toast";
import {
  ShareSaveToastState,
  type ShareSaveToastState as ShareSaveToastStateType,
} from "@/presentation/helpers/sharing/share-save-toast-message";
import { showCaptureNotReadyAlert } from "@/presentation/helpers/sharing/share-capture-alert";

type ShareCaptureMenuProps = {
  accessibilityLabel: string;
  captureHeight?: number;
  captureRef: RefObject<View | null>;
  captureWidth?: number;
  disabled?: boolean;
  disabledMessage?: string;
  fileName: string;
  isReady: boolean;
  onPress?: () => void;
  presentation?: "button" | "controller";
};

export type ShareCaptureMenuHandle = {
  saveImage: () => void;
  shareImage: () => void;
};

type PermissionAlertState = {
  canAskAgain: boolean;
  visible: boolean;
};

function createShareMenuActions(): NativeActionMenuAction[] {
  return [
    {
      icon: "download",
      id: "save",
      title: translate("common.saveImage"),
    },
    {
      icon: "share",
      id: "share",
      title: translate("common.shareAction"),
    },
  ];
}

export const ShareCaptureMenu = forwardRef<
  ShareCaptureMenuHandle,
  ShareCaptureMenuProps
>(function ShareCaptureMenu(props, ref) {
  const {
    accessibilityLabel,
    captureHeight,
    captureRef,
    captureWidth,
    disabled = false,
    disabledMessage,
    fileName,
    isReady,
    onPress,
    presentation = "button",
  } = props;
  const [permissionAlert, setPermissionAlert] = useState<PermissionAlertState>({
    canAskAgain: true,
    visible: false,
  });
  const { isProcessing, saveImage, shareImage } = useShareCapture({
    captureHeight,
    captureWidth,
    fileName,
    getCaptureTarget: () => captureRef.current,
    isReady: isReady && !disabled,
  });
  const [saveToastState, setSaveToastState] = useState<ShareSaveToastStateType>(
    ShareSaveToastState.hidden,
  );
  const isBlockedWithMessage = disabled && Boolean(disabledMessage);

  const handleBlockedPress = () => {
    if (!disabledMessage) {
      return;
    }

    Alert.alert(translate("sharing.notReadyTitle"), disabledMessage);
  };

  const handleSaveImage = async () => {
    if (disabled || isProcessing) {
      handleBlockedPress();
      return;
    }

    setSaveToastState(ShareSaveToastState.saving);
    const result = await saveImage();

    if (result.type === SaveCapturedImageResult.saved) {
      setSaveToastState(ShareSaveToastState.saved);
      return;
    }

    if (result.type === SaveCapturedImageResult.failed) {
      setSaveToastState(ShareSaveToastState.failed);
      return;
    }

    setSaveToastState(ShareSaveToastState.hidden);

    if (result.type === SaveCapturedImageResult.permissionDenied) {
      setPermissionAlert({
        canAskAgain: result.canAskAgain,
        visible: true,
      });
      return;
    }

    showCaptureNotReadyAlert();
  };

  const handleShareImage = async () => {
    if (disabled || isProcessing) {
      handleBlockedPress();
      return;
    }

    const result = await shareImage();

    if (result === ShareCapturedImageResult.unavailable) {
      Alert.alert(
        translate("sharing.notAvailableTitle"),
        translate("sharing.notAvailableMessage"),
      );
    } else if (result === ShareCapturedImageResult.failed) {
      Alert.alert(
        translate("sharing.shareFailedTitle"),
        translate("sharing.shareFailedMessage"),
      );
    } else if (result === ShareCapturedImageResult.notReady) {
      showCaptureNotReadyAlert();
    }
  };

  const handleClosePermissionAlert = () => {
    setPermissionAlert((current) => ({
      ...current,
      visible: false,
    }));
  };

  const handleHideSaveToast = () => {
    setSaveToastState(ShareSaveToastState.hidden);
  };

  useImperativeHandle(ref, () => ({
    saveImage: () => {
      void handleSaveImage();
    },
    shareImage: () => {
      void handleShareImage();
    },
  }));

  const handleTriggerPress = () => {
    if (disabled || isProcessing) {
      handleBlockedPress();
      return;
    }

    onPress?.();
  };

  const shouldShowActionMenu = runtimePlatform === "android";

  const feedback = (
    <>
      <MediaLibraryPermissionAlert
        canAskAgain={permissionAlert.canAskAgain}
        visible={permissionAlert.visible}
        onClose={handleClosePermissionAlert}
        onOpenSettings={() => {
          void openDeviceAppSettings();
        }}
      />
      <ShareSaveToast state={saveToastState} onDone={handleHideSaveToast} />
    </>
  );

  if (presentation === "controller") {
    return <View style={styles.root}>{feedback}</View>;
  }

  return (
    <View style={styles.root}>
      {onPress ? (
        <SymbolIconButton
          accessibilityLabel={accessibilityLabel}
          disabled={disabled && !isBlockedWithMessage}
          icon="Share"
          isDimmed={isBlockedWithMessage}
          onPress={handleTriggerPress}
        />
      ) : shouldShowActionMenu && !isBlockedWithMessage ? (
        <NativeActionMenu
          accessibilityLabel={accessibilityLabel}
          actions={createShareMenuActions().map((action) => ({
            ...action,
            disabled: isProcessing,
          }))}
          onPressAction={(actionId) => {
            if (actionId === "save") {
              void handleSaveImage();
              return;
            }

            if (actionId === "share") {
              void handleShareImage();
            }
          }}
        >
          <View style={styles.nativeMenuTrigger}>
            <ReiconIcon color="#FFFFFF" name="Share" size={24} />
          </View>
        </NativeActionMenu>
      ) : (
        <SymbolIconButton
          accessibilityLabel={accessibilityLabel}
          disabled={disabled && !isBlockedWithMessage}
          icon="Share"
          isDimmed={isBlockedWithMessage}
          onPress={handleShareImage}
        />
      )}
      {feedback}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
    position: "relative",
  },
  nativeMenuTrigger: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.26)",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
});
