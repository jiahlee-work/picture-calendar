export const appFontFamilies = {
  bold: "PretendardBold",
  light: "PretendardLight",
  regular: "PretendardRegular",
} as const;

export const appNativeFontFamily = "Pretendard";

type AppFontFamilyOptions = {
  fontFamily?: string;
  fontWeight?: number | string;
};

export function resolveAppFontFamily(
  options: AppFontFamilyOptions,
): string | null {
  if (options.fontFamily) {
    return null;
  }

  if (options.fontWeight === "bold") {
    return appFontFamilies.bold;
  }

  const numericWeight = Number(options.fontWeight);

  if (Number.isFinite(numericWeight)) {
    if (numericWeight <= 300) {
      return appFontFamilies.light;
    }

    if (numericWeight >= 600) {
      return appFontFamilies.bold;
    }
  }

  return appFontFamilies.regular;
}
