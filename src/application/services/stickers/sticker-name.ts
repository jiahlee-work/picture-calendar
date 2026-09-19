import { translate } from "@/application/services/localization/app-i18n";

export function toDefaultStickerName(fileName: string | null): string {
  if (!fileName) {
    return translate("photo.clipboardImage");
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
