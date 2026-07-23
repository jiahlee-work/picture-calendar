import { Directory, File, Paths } from "expo-file-system";

import type {
  StickerFileStore,
  StoredStickerFile,
} from "@/shared/stickers/types";
import {
  imageFileExtensionFromFileName,
  imageFileExtensionFromMimeType,
  sanitizeStoragePathSegment,
} from "@/shared/daily-photo/storage-key";
import { dayjs } from "@/shared/date/dayjs";
import { toStickerStorageKey } from "@/shared/stickers/storage-key";

const STICKERS_DIRECTORY_NAME = "stickers";

export function createLocalStickerFileStore(): StickerFileStore {
  return {
    async save({ base64, fileName, mimeType, sourceUri, userId }) {
      const source = toSourceFile(sourceUri);
      const storageKey = toStickerStorageKey({
        userId,
        extension:
          imageFileExtensionFromMimeType(mimeType) ??
          imageFileExtensionFromFileName(fileName) ??
          source?.extension,
        revision: dayjs().valueOf().toString(36),
      });
      const destination = toStickerFile(storageKey);

      ensureDirectory(
        new Directory(
          Paths.document,
          STICKERS_DIRECTORY_NAME,
          sanitizeStoragePathSegment(userId),
        ),
      );

      if (destination.exists) {
        destination.delete();
      }

      await copyStickerImageToDestination({
        base64,
        destination,
        source,
        sourceUri,
      });

      return toStoredStickerFile(storageKey, destination.uri);
    },
    async delete(storageKey) {
      const file = toStickerFile(storageKey);

      if (file.exists) {
        file.delete();
      }
    },
  };
}

async function copyStickerImageToDestination({
  base64,
  destination,
  source,
  sourceUri,
}: {
  base64?: string | null;
  destination: File;
  source: File | null;
  sourceUri: string;
}) {
  if (source) {
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

  if (base64) {
    writeBase64ToDestination(base64, destination);
    return;
  }

  await writeUriBytesToDestination(sourceUri, destination);
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

function toStickerFile(storageKey: string): File {
  return new File(
    Paths.document,
    STICKERS_DIRECTORY_NAME,
    ...storageKey.split("/"),
  );
}

function ensureDirectory(directory: Directory) {
  directory.create({
    idempotent: true,
    intermediates: true,
  });
}

function toSourceFile(sourceUri: string): File | null {
  try {
    return new File(sourceUri);
  } catch {
    return null;
  }
}

function toStoredStickerFile(
  storageKey: string,
  uri: string,
): StoredStickerFile {
  return {
    imagePath: uri,
    storageKey,
  };
}
