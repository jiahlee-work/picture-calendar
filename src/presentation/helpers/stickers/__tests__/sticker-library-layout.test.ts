import { describe, expect, it } from "vitest";

import { getStickerLibraryGridLayout } from "@/presentation/helpers/stickers/sticker-library-layout";

describe("sticker library layout", () => {
  it("calculates a three-column card width below the wide breakpoint", () => {
    expect(getStickerLibraryGridLayout(390, 24)).toEqual({
      cardGap: 12,
      cardWidth: 106,
    });
  });

  it("calculates a four-column card width at the wide breakpoint", () => {
    expect(getStickerLibraryGridLayout(768, 24)).toEqual({
      cardGap: 12,
      cardWidth: 171,
    });
  });
});
