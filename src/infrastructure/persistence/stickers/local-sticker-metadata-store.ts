import { Directory, File, Paths } from "expo-file-system";

import type {
  StickerMetadataStore,
  UserStickerAsset,
} from "@/shared/stickers/types";

const STICKERS_DIRECTORY_NAME = "stickers";
const METADATA_FILE_NAME = "metadata.json";

export function createLocalStickerMetadataStore(): StickerMetadataStore {
  const directory = new Directory(Paths.document, STICKERS_DIRECTORY_NAME);
  const file = new File(directory, METADATA_FILE_NAME);

  return {
    async load() {
      if (!file.exists) {
        return [];
      }

      const contents = await file.text();

      if (!contents.trim()) {
        return [];
      }

      const parsed = JSON.parse(contents);

      if (!Array.isArray(parsed)) {
        return [];
      }

      const stickers = parsed
        .map(toUserStickerAsset)
        .filter(isUserStickerAsset)
        .map(toStickerWithCurrentFileUri);

      if (
        stickers.length !== parsed.length ||
        hasRepairedStickerUris(parsed, stickers)
      ) {
        writeMetadata(directory, file, stickers);
      }

      return stickers;
    },
    async save(stickers) {
      writeMetadata(directory, file, stickers);
    },
  };
}

function writeMetadata(
  directory: Directory,
  file: File,
  stickers: UserStickerAsset[],
) {
  directory.create({
    idempotent: true,
    intermediates: true,
  });

  if (!file.exists) {
    file.create({
      intermediates: true,
      overwrite: true,
    });
  }

  file.write(JSON.stringify(stickers, null, 2));
}

function isUserStickerAsset(
  sticker: UserStickerAsset | null,
): sticker is UserStickerAsset {
  return sticker !== null;
}

function toUserStickerAsset(value: unknown): UserStickerAsset | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  const userId = stringValue(value.userId);
  const imagePath = stringValue(value.imagePath);
  const createdAt = stringValue(value.createdAt);

  if (!id || !userId || !imagePath || !createdAt) {
    return null;
  }

  return {
    id,
    source: "user",
    userId,
    imagePath,
    storageKey: stringValue(value.storageKey),
    name: stringValue(value.name) ?? undefined,
    tags: stringArrayValue(value.tags),
    isFavorite: booleanValue(value.isFavorite) ?? undefined,
    createdAt,
  };
}

function toStickerWithCurrentFileUri(
  sticker: UserStickerAsset,
): UserStickerAsset {
  const currentFileUri = getCurrentStoredFileUri(sticker.storageKey);

  if (!currentFileUri || currentFileUri === sticker.imagePath) {
    return sticker;
  }

  return {
    ...sticker,
    imagePath: currentFileUri,
  };
}

function getCurrentStoredFileUri(storageKey: string | null): string | null {
  if (!storageKey) {
    return null;
  }

  const file = new File(
    Paths.document,
    STICKERS_DIRECTORY_NAME,
    ...storageKey.split("/"),
  );

  return file.exists ? file.uri : null;
}

function hasRepairedStickerUris(
  parsed: unknown[],
  stickers: UserStickerAsset[],
): boolean {
  return stickers.some((sticker, index) => {
    const parsedSticker = parsed[index];

    return (
      isObjectRecord(parsedSticker) &&
      stringValue(parsedSticker.imagePath) !== sticker.imagePath
    );
  });
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function stringArrayValue(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((item): item is string => typeof item === "string");
}

function booleanValue(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}
