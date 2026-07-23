import {
  normalizeImageFileExtension,
  sanitizeStoragePathSegment,
} from "@/shared/daily-photo/storage-key";

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
