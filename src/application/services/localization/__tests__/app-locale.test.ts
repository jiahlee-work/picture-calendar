import { describe, expect, it } from "vitest";

import { resolveAppLocale } from "@/application/services/localization/app-locale";

describe("app locale", () => {
  it.each([
    ["ko-KR", "ko"],
    ["en-US", "en"],
    ["ja-JP", "ja"],
    ["zh-CN", "zh"],
    ["zh-Hans", "zh"],
    ["zh-Hant", "zh"],
  ] as const)("maps %s to %s", (languageCode, expectedLocale) => {
    expect(resolveAppLocale(languageCode)).toBe(expectedLocale);
  });

  it.each([undefined, null, "fr-FR", "de-DE"])(
    "falls back to English for %s",
    (languageCode) => {
      expect(resolveAppLocale(languageCode)).toBe("en");
    },
  );
});
