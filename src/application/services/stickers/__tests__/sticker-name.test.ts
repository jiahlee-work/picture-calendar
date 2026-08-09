import { describe, expect, it } from "vitest";

import { toDefaultStickerName } from "@/application/services/stickers/sticker-name";

describe("toDefaultStickerName", () => {
  it("uses clipboard copy when no file name is available", () => {
    expect(toDefaultStickerName(null)).toBe("클립보드 이미지");
  });

  it("decodes the file name and removes the extension", () => {
    expect(toDefaultStickerName("my%20sticker.png")).toBe("my sticker");
  });

  it("falls back to the original file name when decoding fails", () => {
    expect(toDefaultStickerName("bad%name.png")).toBe("bad%name");
  });
});
