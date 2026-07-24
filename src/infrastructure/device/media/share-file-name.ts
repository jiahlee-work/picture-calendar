export function toSharePngFileName(fileName: string): string {
  const sanitizedFileName = fileName
    .replace(/\.png$/i, "")
    .replace(/[^A-Za-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  return `${sanitizedFileName || "pical-share"}.png`;
}
