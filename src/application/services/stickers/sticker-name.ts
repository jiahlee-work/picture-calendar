export function toDefaultStickerName(fileName: string | null): string {
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
