import { useState, type RefObject } from "react";
import { Alert, StyleSheet, View } from "react-native";

import {
  SaveCapturedImageResult,
  ShareCapturedImageResult,
  useShareCapture,
} from "@/application/hooks/use-share-capture";
import { openDeviceAppSettings } from "@/application/services/device/open-device-app-settings";
import { runtimePlatform } from "@/infrastructure/device/runtime-platform";
import { SymbolIconButton } from "@/presentation/components/atoms/symbol-icon-button";
import { Menu } from "@/presentation/components/molecules/menu";
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
};

type PermissionAlertState = {
  canAskAgain: boolean;
  visible: boolean;
};

export function ShareCaptureMenu(props: ShareCaptureMenuProps) {
  const {
    accessibilityLabel,
    captureHeight,
    captureRef,
    captureWidth,
    disabled = false,
    disabledMessage,
    fileName,
    isReady,
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

    Alert.alert("저장 필요", disabledMessage);
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
      Alert.alert("공유 불가", "이 기기에서는 공유 기능을 사용할 수 없어요.");
    } else if (result === ShareCapturedImageResult.failed) {
      Alert.alert(
        "공유 실패",
        "이미지를 공유하지 못했어요. 잠시 후 다시 시도해 주세요.",
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

  const shouldShowActionMenu = runtimePlatform === "android";

  return (
    <View style={styles.root}>
      {shouldShowActionMenu && !isBlockedWithMessage ? (
        <Menu
          accessibilityLabel={accessibilityLabel}
          disabled={disabled}
          trigger={{ icon: "Share" }}
        >
          <Menu.Item
            icon="Download"
            label="이미지 저장"
            onPress={handleSaveImage}
          />
          <Menu.Item icon="Share" label="공유하기" onPress={handleShareImage} />
        </Menu>
      ) : (
        <SymbolIconButton
          accessibilityLabel={accessibilityLabel}
          disabled={disabled && !isBlockedWithMessage}
          icon="Share"
          isDimmed={isBlockedWithMessage}
          onPress={handleShareImage}
        />
      )}
      <MediaLibraryPermissionAlert
        canAskAgain={permissionAlert.canAskAgain}
        visible={permissionAlert.visible}
        onClose={handleClosePermissionAlert}
        onOpenSettings={() => {
          void openDeviceAppSettings();
        }}
      />
      <ShareSaveToast state={saveToastState} onDone={handleHideSaveToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
    position: "relative",
  },
});
