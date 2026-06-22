const fallbackImageExtension = ".jpg";

export function toDailyPhotoStorageKey({
  date,
  extension,
  revision,
  userId,
}: {
  date: string;
  extension: string | null | undefined;
  revision?: string | null;
  userId: string;
}): string {
  const fileRevision = revision ? `-${sanitizeStoragePathSegment(revision)}` : "";

  return `${sanitizeStoragePathSegment(userId)}/${date}${fileRevision}${normalizeImageFileExtension(extension)}`;
}

export function sanitizeStoragePathSegment(value: string): string {
  const sanitized = value.trim().replace(/[^a-zA-Z0-9._-]+/g, "_");

  return sanitized.length > 0 ? sanitized : "user";
}

export function normalizeImageFileExtension(extension: string | null | undefined): string {
  if (!extension) {
    return fallbackImageExtension;
  }

  const normalized = extension.trim().toLowerCase().split("?")[0]?.split("#")[0] ?? "";
  const withDot = normalized.startsWith(".") ? normalized : `.${normalized}`;

  if (withDot === ".jpeg") {
    return ".jpg";
  }

  if (/^\.[a-z0-9]+$/.test(withDot)) {
    return withDot;
  }

  return fallbackImageExtension;
}

export function imageFileExtensionFromMimeType(mimeType: string | null | undefined): string | null {
  if (!mimeType) {
    return null;
  }

  switch (mimeType.toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/heic":
      return ".heic";
    case "image/heif":
      return ".heif";
    case "image/webp":
      return ".webp";
    default:
      return null;
  }
}

export function imageFileExtensionFromFileName(fileName: string | null | undefined): string | null {
  if (!fileName) {
    return null;
  }

  const extension = fileName.match(/\.[a-zA-Z0-9]+$/)?.[0];

  return extension ?? null;
}
