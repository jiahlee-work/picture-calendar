import { I18n, type TranslateOptions } from "i18n-js";

import type { AppLocale } from "@/application/services/localization/app-locale";
import { appTranslations } from "@/application/services/localization/app-translations";

const DEFAULT_APP_LOCALE: AppLocale = "en";
const i18n = new I18n(appTranslations);
let currentAppLocale: AppLocale = DEFAULT_APP_LOCALE;

i18n.defaultLocale = DEFAULT_APP_LOCALE;
i18n.enableFallback = true;

export function configureAppLocale(locale: AppLocale): void {
  currentAppLocale = locale;
  i18n.locale = locale;
}

export function getCurrentAppLocale(): AppLocale {
  return currentAppLocale;
}

export function translate(key: string, options?: TranslateOptions): string {
  return i18n.t(key, options);
}

export function formatAppMonthName(date: Date, locale = getCurrentAppLocale()) {
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
}

export function formatAppMonthNameShort(
  date: Date,
  locale = getCurrentAppLocale(),
) {
  return new Intl.DateTimeFormat(locale, { month: "short" }).format(date);
}

export function formatAppMonthYearShort(
  date: Date,
  locale = getCurrentAppLocale(),
) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatAppWeekdayLabels(locale = getCurrentAppLocale()) {
  const sunday = new Date(2026, 0, 4);
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });

  return Array.from({ length: 7 }, (_, dayOffset) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + dayOffset);
    return formatter.format(date).toLocaleUpperCase(locale);
  });
}

export function formatAppMonthYear(date: Date, locale = getCurrentAppLocale()) {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatAppYear(year: number, locale = getCurrentAppLocale()) {
  return new Intl.NumberFormat(locale, { useGrouping: false }).format(year);
}

configureAppLocale(DEFAULT_APP_LOCALE);
