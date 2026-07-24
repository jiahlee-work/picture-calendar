import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { createStickerFileStoreForRuntime } from "@/application/services/stickers/sticker-file-store-factory";
import { createStickerRepositoryForRuntime } from "@/application/services/stickers/sticker-repository-factory";
import type {
  StickerAsset,
  UserStickerAsset,
} from "@/application/services/stickers/types";
import { LOCAL_USER_ID } from "@/application/services/local-user";
import { readImageFromClipboard } from "@/infrastructure/device/media/clipboard-image";
import {
  pickImageFromLibrary,
  type PickedImage,
} from "@/infrastructure/device/media/image-picker";
import { logger } from "@/infrastructure/logging/logger";

type StickerRegistrationResult =
  | "saved"
  | "cancelled"
  | "empty"
  | "denied"
  | "nativeModuleUnavailable"
  | "failed";

export function useStickerLibrary() {
  const [stickers, setStickers] = useState<StickerAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileStore = useMemo(
    () => createStickerFileStoreForRuntime(Platform.OS),
    [],
  );
  const repository = useMemo(
    () => createStickerRepositoryForRuntime(Platform.OS),
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const loadStickers = async () => {
      setIsLoading(true);

      try {
        const loadedStickers = await repository.listAssets(LOCAL_USER_ID);

        if (isMounted) {
          setStickers(loadedStickers);
        }
      } catch (error) {
        logger.error("Failed to load sticker assets", { error });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadStickers();

    return () => {
      isMounted = false;
    };
  }, [repository]);

  const registerFromLibrary = async (): Promise<StickerRegistrationResult> => {
    try {
      const pickedImage = await pickImageFromLibrary();

      if (!pickedImage) {
        return "cancelled";
      }

      return savePickedSticker(pickedImage);
    } catch (error) {
      logger.error("Failed to pick sticker image from library", { error });
      return "failed";
    }
  };

  const registerFromClipboard =
    async (): Promise<StickerRegistrationResult> => {
      try {
        const result = await readImageFromClipboard();

        if (result.status !== "success") {
          return result.status;
        }

        return savePickedSticker(result.image);
      } catch (error) {
        logger.error("Failed to paste sticker image from clipboard", { error });
        return "failed";
      }
    };

  const deleteUserSticker = async (assetId: string): Promise<boolean> => {
    try {
      const deletedSticker = await repository.deleteUserAsset(
        LOCAL_USER_ID,
        assetId,
      );

      if (!deletedSticker) {
        return false;
      }

      setStickers((current) =>
        current.filter((sticker) => sticker.id !== assetId),
      );

      return true;
    } catch (error) {
      logger.error("Failed to delete sticker asset", { assetId, error });
      return false;
    }
  };

  const updateUserStickerFavorite = async (
    assetId: string,
    isFavorite: boolean,
  ): Promise<UserStickerAsset | null> => {
    setIsSaving(true);

    try {
      const updatedSticker = await repository.updateUserAsset(
        LOCAL_USER_ID,
        assetId,
        {
          isFavorite,
        },
      );

      if (!updatedSticker) {
        return null;
      }

      setStickers((current) =>
        current.map((sticker) =>
          sticker.id === assetId ? updatedSticker : sticker,
        ),
      );

      return updatedSticker;
    } catch (error) {
      logger.error("Failed to update sticker favorite", {
        assetId,
        error,
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const savePickedSticker = async (
    pickedImage: PickedImage,
  ): Promise<StickerRegistrationResult> => {
    let storedFile: Awaited<ReturnType<typeof fileStore.save>> | null = null;

    setIsSaving(true);

    try {
      storedFile = await fileStore.save({
        userId: LOCAL_USER_ID,
        base64: pickedImage.base64,
        fileName: pickedImage.fileName,
        mimeType: pickedImage.mimeType,
        sourceUri: pickedImage.uri,
      });

      await repository.saveUserAsset({
        userId: LOCAL_USER_ID,
        imagePath: storedFile.imagePath,
        storageKey: storedFile.storageKey,
        name: toDefaultStickerName(pickedImage.fileName),
      });
      const loadedStickers = await repository.listAssets(LOCAL_USER_ID);

      setStickers(loadedStickers);

      return "saved";
    } catch (error) {
      if (storedFile) {
        await deleteStoredStickerFile(storedFile.storageKey);
      }

      logger.error("Failed to save sticker asset", { error });
      return "failed";
    } finally {
      setIsSaving(false);
    }
  };

  const deleteStoredStickerFile = async (storageKey: string) => {
    try {
      await fileStore.delete(storageKey);
    } catch (error) {
      logger.warn("Failed to delete unsaved sticker file", {
        storageKey,
        error,
      });
    }
  };

  return {
    stickers,
    isLoading,
    isSaving,
    deleteUserSticker,
    registerFromClipboard,
    registerFromLibrary,
    updateUserStickerFavorite,
  };
}

function toDefaultStickerName(fileName: string | null): string {
  if (!fileName) {
    return "클립보드 이미지";
  }

  const decodedFileName = decodeFileName(fileName);
  const fileNameWithoutExtension = decodedFileName.replace(/\.[^.]+$/, "");
  const normalizedName = fileNameWithoutExtension.trim();

  return normalizedName || decodedFileName;
}

function decodeFileName(fileName: string): string {
  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
}
