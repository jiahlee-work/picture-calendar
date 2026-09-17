import { describe, expect, it } from "vitest";

import {
  appFontFamilies,
  resolveAppFontFamily,
} from "@/presentation/theme/app-typography";

describe("resolveAppFontFamily", () => {
  it.each([undefined, "normal", "400", "500"])(
    "%s 굵기를 Pretendard Regular로 연결한다",
    (fontWeight) => {
      expect(resolveAppFontFamily({ fontWeight })).toBe(
        appFontFamilies.regular,
      );
    },
  );

  it.each(["100", "200", "300"])(
    "%s 굵기를 Pretendard Light로 연결한다",
    (fontWeight) => {
      expect(resolveAppFontFamily({ fontWeight })).toBe(appFontFamilies.light);
    },
  );

  it.each(["600", "700", "800", "900", "bold"])(
    "%s 굵기를 Pretendard Bold로 연결한다",
    (fontWeight) => {
      expect(resolveAppFontFamily({ fontWeight })).toBe(appFontFamilies.bold);
    },
  );

  it("명시적으로 선택한 서체를 덮어쓰지 않는다", () => {
    expect(
      resolveAppFontFamily({
        fontFamily: "MaruBuriRegular",
        fontWeight: "400",
      }),
    ).toBeNull();
  });
});
