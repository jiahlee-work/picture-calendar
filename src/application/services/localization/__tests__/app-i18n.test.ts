import { afterEach, describe, expect, it } from "vitest";

import {
  configureAppLocale,
  formatAppMonthYear,
  translate,
} from "@/application/services/localization/app-i18n";
import { APP_LOCALES } from "@/application/services/localization/app-locale";
import { appTranslations } from "@/application/services/localization/app-translations";

describe("app localization", () => {
  afterEach(() => {
    configureAppLocale("en");
  });

  it.each([
    ["ko", "안녕하세요"],
    ["en", "Hello"],
    ["ja", "こんにちは"],
    ["zh", "你好"],
  ] as const)("translates widget copy for %s", (locale, expected) => {
    configureAppLocale(locale);

    expect(translate("widgets.greeting")).toBe(expected);
  });

  it("formats month and year using the selected locale", () => {
    const date = new Date(2026, 8, 1);

    configureAppLocale("en");
    expect(formatAppMonthYear(date)).toContain("September");

    configureAppLocale("ja");
    expect(formatAppMonthYear(date)).toContain("9月");
  });

  it("keeps translation keys aligned across every supported locale", () => {
    const referenceKeys = collectLeafKeys(appTranslations.en);

    for (const locale of APP_LOCALES) {
      expect(collectLeafKeys(appTranslations[locale])).toEqual(referenceKeys);
    }
  });
});

function collectLeafKeys(
  value: Record<string, unknown>,
  prefix = "",
): string[] {
  return Object.entries(value)
    .flatMap(([key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key;

      if (typeof child === "string") {
        return [path];
      }

      return collectLeafKeys(child as Record<string, unknown>, path);
    })
    .sort();
}
