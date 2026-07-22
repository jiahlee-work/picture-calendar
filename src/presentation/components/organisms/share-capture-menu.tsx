import { useRef, useState, type RefObject } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";
import { type SymbolViewProps } from "expo-symbols";
import {
  captureRef as captureViewRef,
  releaseCapture,
  type CaptureOptions,
} from "react-native-view-shot";

import {
  MediaLibraryWritePermissionType,
  requestPhotoLibraryWritePermission,
  saveImageToPhotoLibrary,
  ShareImageFileResult,
  shareImageFile,
} from "@/infrastructure/device/media/share-image";
import { logger } from "@/infrastructure/logging/logger";
import { SymbolIconButton } from "@/presentation/components/atoms/symbol-icon-button";
import { MediaLibraryPermissionAlert } from "@/presentation/components/molecules/media-library-permission-alert";
import {
  ShareSaveToast,
  ShareSaveToastState,
  type ShareSaveToastState as ShareSaveToastStateType,
} from "@/presentation/components/molecules/share-save-toast";
import { Menu } from "@/presentation/components/organisms/menu";

type ShareCaptureMenuProps = {
  accessibilityLabel: string;
  captureHeight?: number;
  captureRef: RefObject<View | null>;
  captureWidth?: number;
  fileName: string;
  isReady: boolean;
};

const ShareOperation = {
  idle: "idle",
  saving: "saving",
  sharing: "sharing",
} as const;

type ShareOperation = (typeof ShareOperation)[keyof typeof ShareOperation];
type PermissionAlertState = {
  canAskAgain: boolean;
  visible: boolean;
};

const SHARE_ICON: SymbolViewProps["name"] = {
  android: "share",
  ios: "square.and.arrow.up",
};
const SAVE_ICON: SymbolViewProps["name"] = {
  android: "download",
  ios: "square.and.arrow.down",
};

export function ShareCaptureMenu(props: ShareCaptureMenuProps) {
  const {
    accessibilityLabel,
    captureHeight,
    captureRef,
    captureWidth,
    fileName,
    isReady,
  } = props;
  const [permissionAlert, setPermissionAlert] = useState<PermissionAlertState>({
    canAskAgain: true,
    visible: false,
  });
  const [operation, setOperation] = useState<ShareOperation>(
    ShareOperation.idle,
  );
  const [saveToastState, setSaveToastState] = useState<ShareSaveToastStateType>(
    ShareSaveToastState.hidden,
  );
  const latestCaptureUriRef = useRef<string | null>(null);
  const isProcessing = operation !== ShareOperation.idle;

  const captureImage = async () => {
    if (!captureRef.current || !isReady) {
      Alert.alert(
        "공유할 수 없음",
        "이미지를 만들 콘텐츠가 아직 준비되지 않았어요.",
      );
      return null;
    }

    const captureOptions: CaptureOptions = {
      fileName,
      format: "png",
      quality: 1,
      result: "tmpfile",
    };

    if (captureHeight) {
      captureOptions.height = captureHeight;
    }

    if (captureWidth) {
      captureOptions.width = captureWidth;
    }

    const uri = await captureViewRef(captureRef, captureOptions);

    latestCaptureUriRef.current = uri;
    return uri;
  };

  const releaseLatestCapture = () => {
    if (!latestCaptureUriRef.current) {
      return;
    }

    releaseCapture(latestCaptureUriRef.current);
    latestCaptureUriRef.current = null;
  };

  const handleSaveImage = async () => {
    if (isProcessing) {
      return;
    }

    setOperation(ShareOperation.saving);
    setSaveToastState(ShareSaveToastState.saving);

    try {
      const permission = await requestPhotoLibraryWritePermission();

      if (permission.type === MediaLibraryWritePermissionType.denied) {
        setSaveToastState(ShareSaveToastState.hidden);
        setPermissionAlert({
          canAskAgain: permission.canAskAgain,
          visible: true,
        });
        return;
      }

      const uri = await captureImage();

      if (!uri) {
        setSaveToastState(ShareSaveToastState.hidden);
        return;
      }

      await saveImageToPhotoLibrary(uri);
      setSaveToastState(ShareSaveToastState.saved);
    } catch (error) {
      logger.error("Failed to save shared image", { error });
      setSaveToastState(ShareSaveToastState.failed);
    } finally {
      releaseLatestCapture();
      setOperation(ShareOperation.idle);
    }
  };

  const handleShareImage = async () => {
    if (isProcessing) {
      return;
    }

    setOperation(ShareOperation.sharing);

    try {
      const uri = await captureImage();

      if (!uri) {
        return;
      }

      const result = await shareImageFile(uri, fileName);

      if (result === ShareImageFileResult.unavailable) {
        Alert.alert("공유 불가", "이 기기에서는 공유 기능을 사용할 수 없어요.");
      }
    } catch (error) {
      logger.error("Failed to share image", { error });
      Alert.alert(
        "공유 실패",
        "이미지를 공유하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      releaseLatestCapture();
      setOperation(ShareOperation.idle);
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

  const shouldShowActionMenu = Platform.OS === "android";

  return (
    <View style={styles.root}>
      {shouldShowActionMenu ? (
        <Menu
          accessibilityLabel={accessibilityLabel}
          trigger={{ icon: SHARE_ICON }}
        >
          <Menu.Item
            icon={SAVE_ICON}
            label="이미지 저장"
            onPress={handleSaveImage}
          />
          <Menu.Item
            icon={SHARE_ICON}
            label="공유하기"
            onPress={handleShareImage}
          />
        </Menu>
      ) : (
        <SymbolIconButton
          accessibilityLabel={accessibilityLabel}
          icon={SHARE_ICON}
          onPress={handleShareImage}
        />
      )}
      <MediaLibraryPermissionAlert
        canAskAgain={permissionAlert.canAskAgain}
        visible={permissionAlert.visible}
        onClose={handleClosePermissionAlert}
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
