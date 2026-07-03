import { describe, expect, it, vi } from "vitest";

import { ShareCaptureSaveMenuItem } from "@/presentation/components/organisms/share-capture-save-menu-item.ios";

describe("ShareCaptureSaveMenuItem on iOS", () => {
  it("does not render the separate gallery save menu item", () => {
    expect(ShareCaptureSaveMenuItem({ onPress: vi.fn() })).toBeNull();
  });
});
