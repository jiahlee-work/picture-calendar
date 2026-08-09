import { useRef, useState } from "react";

import {
  MediaLibraryWritePermissionType,
  requestPhotoLibraryWritePermission,
  saveImageToPhotoLibrary,
  ShareImageFileResult,
  shareImageFile,
} from "@/infrastructure/device/media/share-image";
import {
  captureViewImage,
  releaseCapturedViewImage,
  type CaptureViewTarget,
} from "@/infrastructure/device/media/capture-view-image";
import { logger } from "@/infrastructure/logging/logger";

export const SaveCapturedImageResult = {
  failed: "failed",
  notReady: "notReady",
  permissionDenied: "permissionDenied",
  saved: "saved",
} as const;

export type SaveCapturedImageResult =
  | {
      type: typeof SaveCapturedImageResult.permissionDenied;
      canAskAgain: boolean;
    }
  | {
      type:
        | typeof SaveCapturedImageResult.failed
        | typeof SaveCapturedImageResult.notReady
        | typeof SaveCapturedImageResult.saved;
    };

export const ShareCapturedImageResult = {
  failed: "failed",
  notReady: "notReady",
  shared: "shared",
  unavailable: "unavailable",
} as const;

export type ShareCapturedImageResult =
  (typeof ShareCapturedImageResult)[keyof typeof ShareCapturedImageResult];

type UseShareCaptureOptions = {
  captureHeight?: number;
  captureWidth?: number;
  fileName: string;
  getCaptureTarget: () => CaptureViewTarget | null;
  isReady: boolean;
};

export function useShareCapture(options: UseShareCaptureOptions) {
  const { captureHeight, captureWidth, fileName, getCaptureTarget, isReady } =
    options;
  const [isProcessing, setIsProcessing] = useState(false);
  const latestCaptureUriRef = useRef<string | null>(null);

  const captureImage = async () => {
    const captureTarget = getCaptureTarget();

    if (!captureTarget || !isReady) {
      return null;
    }

    const uri = await captureViewImage(captureTarget, {
      fileName,
      height: captureHeight,
      width: captureWidth,
    });

    latestCaptureUriRef.current = uri;
    return uri;
  };

  const releaseLatestCapture = () => {
    if (!latestCaptureUriRef.current) {
      return;
    }

    releaseCapturedViewImage(latestCaptureUriRef.current);
    latestCaptureUriRef.current = null;
  };

  const saveImage = async (): Promise<SaveCapturedImageResult> => {
    if (isProcessing) {
      return { type: SaveCapturedImageResult.notReady };
    }

    setIsProcessing(true);

    try {
      const permission = await requestPhotoLibraryWritePermission();

      if (permission.type === MediaLibraryWritePermissionType.denied) {
        return {
          canAskAgain: permission.canAskAgain,
          type: SaveCapturedImageResult.permissionDenied,
        };
      }

      const uri = await captureImage();

      if (!uri) {
        return { type: SaveCapturedImageResult.notReady };
      }

      await saveImageToPhotoLibrary(uri);
      return { type: SaveCapturedImageResult.saved };
    } catch (error) {
      logger.error("Failed to save shared image", { error });
      return { type: SaveCapturedImageResult.failed };
    } finally {
      releaseLatestCapture();
      setIsProcessing(false);
    }
  };

  const shareImage = async (): Promise<ShareCapturedImageResult> => {
    if (isProcessing) {
      return ShareCapturedImageResult.notReady;
    }

    setIsProcessing(true);

    try {
      const uri = await captureImage();

      if (!uri) {
        return ShareCapturedImageResult.notReady;
      }

      const result = await shareImageFile(uri, fileName);

      return result === ShareImageFileResult.unavailable
        ? ShareCapturedImageResult.unavailable
        : ShareCapturedImageResult.shared;
    } catch (error) {
      logger.error("Failed to share image", { error });
      return ShareCapturedImageResult.failed;
    } finally {
      releaseLatestCapture();
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    saveImage,
    shareImage,
  };
}
