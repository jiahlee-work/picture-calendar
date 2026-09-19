export const APP_LOCALES = ["ko", "en", "ja", "zh"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

const DEFAULT_APP_LOCALE: AppLocale = "en";

export function resolveAppLocale(languageCode?: string | null): AppLocale {
  const normalizedLanguageCode = languageCode?.toLowerCase();

  if (normalizedLanguageCode?.startsWith("ko")) {
    return "ko";
  }

  if (normalizedLanguageCode?.startsWith("ja")) {
    return "ja";
  }

  if (normalizedLanguageCode?.startsWith("zh")) {
    return "zh";
  }

  return DEFAULT_APP_LOCALE;
}
