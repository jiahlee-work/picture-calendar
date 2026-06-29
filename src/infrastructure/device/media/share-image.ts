import { requestPermissionsAsync, saveToLibraryAsync } from "expo-media-library/legacy";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";

import { toSharePngFileName } from "@/infrastructure/device/media/share-file-name";

export const MediaLibraryWritePermissionType = {
  denied: "denied",
  granted: "granted",
} as const;

export type MediaLibraryWritePermissionType =
  (typeof MediaLibraryWritePermissionType)[keyof typeof MediaLibraryWritePermissionType];

export type MediaLibraryWritePermissionResult =
  | { type: typeof MediaLibraryWritePermissionType.granted }
  | { canAskAgain: boolean; type: typeof MediaLibraryWritePermissionType.denied };

export const ShareImageFileResult = {
  shared: "shared",
  unavailable: "unavailable",
} as const;

export type ShareImageFileResult = (typeof ShareImageFileResult)[keyof typeof ShareImageFileResult];

export async function requestPhotoLibraryWritePermission(): Promise<MediaLibraryWritePermissionResult> {
  const permission = await requestPermissionsAsync(true, ["photo"]);

  if (permission.granted) {
    return { type: MediaLibraryWritePermissionType.granted };
  }

  return {
    canAskAgain: permission.canAskAgain,
    type: MediaLibraryWritePermissionType.denied,
  };
}

export async function saveImageToPhotoLibrary(fileUri: string): Promise<void> {
  await saveToLibraryAsync(fileUri);
}

export async function prepareImageFileForShare(fileUri: string, fileName: string): Promise<string> {
  const source = new File(fileUri);
  const destination = new File(Paths.cache, toSharePngFileName(fileName));

  if (destination.exists) {
    destination.delete();
  }

  await source.copy(destination);

  return destination.uri;
}

export async function shareImageFile(fileUri: string, fileName: string): Promise<ShareImageFileResult> {
  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    return ShareImageFileResult.unavailable;
  }

  const sharedFileUri = await prepareImageFileForShare(fileUri, fileName);

  await Sharing.shareAsync(sharedFileUri, {
    dialogTitle: "이미지 공유하기",
    mimeType: "image/png",
    UTI: toSharePngFileName(fileName),
  });

  return ShareImageFileResult.shared;
}
