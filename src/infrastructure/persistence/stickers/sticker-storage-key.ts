import {
  normalizeImageFileExtension,
  sanitizeStoragePathSegment,
} from "@/infrastructure/persistence/daily-photo/daily-photo-storage-key";

export function toStickerStorageKey({
  extension,
  revision,
  userId,
}: {
  extension: string | null | undefined;
  revision: string;
  userId: string;
}): string {
  return `${sanitizeStoragePathSegment(userId)}/sticker-${sanitizeStoragePathSegment(revision)}${normalizeImageFileExtension(extension)}`;
}
