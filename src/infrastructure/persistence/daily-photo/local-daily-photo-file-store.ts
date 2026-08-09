import { Directory, File, Paths } from "expo-file-system";

import type {
  DailyPhotoFileStore,
  StoredDailyPhotoFile,
} from "@/shared/daily-photo/types";
import {
  imageFileExtensionFromFileName,
  imageFileExtensionFromMimeType,
  sanitizeStoragePathSegment,
  toDailyPhotoStorageKey,
} from "@/infrastructure/persistence/daily-photo/daily-photo-storage-key";
import { dayjs } from "@/shared/date/dayjs";

const DAILY_PHOTOS_DIRECTORY_NAME = "daily-photos";

export function createLocalDailyPhotoFileStore(): DailyPhotoFileStore {
  return {
    async save({ base64, date, fileName, mimeType, sourceUri, userId }) {
      const source = new File(sourceUri);
      const storageKey = toDailyPhotoStorageKey({
        userId,
        date,
        extension:
          imageFileExtensionFromMimeType(mimeType) ??
          imageFileExtensionFromFileName(fileName) ??
          source.extension,
        revision: dayjs().valueOf().toString(36),
      });
      const destination = toDailyPhotoFile(storageKey);

      ensureDirectory(
        new Directory(
          Paths.document,
          DAILY_PHOTOS_DIRECTORY_NAME,
          sanitizeStoragePathSegment(userId),
        ),
      );

      if (destination.exists) {
        destination.delete();
      }

      await copyPickedImageToDestination({
        base64,
        destination,
        source,
        sourceUri,
      });

      return toStoredDailyPhotoFile(storageKey, destination.uri);
    },
    async delete(storageKey) {
      const file = toDailyPhotoFile(storageKey);

      if (file.exists) {
        file.delete();
      }
    },
  };
}

async function copyPickedImageToDestination({
  base64,
  destination,
  source,
  sourceUri,
}: {
  base64?: string | null;
  destination: File;
  source: File;
  sourceUri: string;
}) {
  try {
    await source.copy(destination);
    return;
  } catch (copyError) {
    try {
      await writeUriBytesToDestination(sourceUri, destination);
      return;
    } catch (fetchError) {
      if (base64) {
        writeBase64ToDestination(base64, destination);
        return;
      }

      throw copyError instanceof Error ? copyError : fetchError;
    }
  }
}

async function writeUriBytesToDestination(
  sourceUri: string,
  destination: File,
) {
  const response = await fetch(sourceUri);
  const bytes = new Uint8Array(await response.arrayBuffer());

  writeBytesToDestination(bytes, destination);
}

function writeBase64ToDestination(base64: string, destination: File) {
  ensureDestinationFile(destination);
  destination.write(base64, { encoding: "base64" });
}

function writeBytesToDestination(bytes: Uint8Array, destination: File) {
  ensureDestinationFile(destination);
  destination.write(bytes);
}

function ensureDestinationFile(destination: File) {
  if (!destination.exists) {
    destination.create({
      intermediates: true,
      overwrite: true,
    });
  }
}

function toDailyPhotoFile(storageKey: string): File {
  const [userDirectory, fileName] = storageKey.split("/");

  return new File(
    Paths.document,
    DAILY_PHOTOS_DIRECTORY_NAME,
    userDirectory,
    fileName,
  );
}

function ensureDirectory(directory: Directory) {
  directory.create({
    idempotent: true,
    intermediates: true,
  });
}

function toStoredDailyPhotoFile(
  storageKey: string,
  uri: string,
): StoredDailyPhotoFile {
  return {
    imagePath: uri,
    localImagePath: uri,
    remoteImageUrl: null,
    storageKey,
    syncStatus: "local",
  };
}
