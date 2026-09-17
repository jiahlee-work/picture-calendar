import { describe, expect, it } from "vitest";

import { getAppUpdateStoreLinks } from "@/infrastructure/device/app-update-links";

describe("getAppUpdateStoreLinks", () => {
  it("creates Google Play deep links from the Android package name", () => {
    expect(getAppUpdateStoreLinks("android")).toEqual({
      deepLink: "market://details?id=com.jiahleework.pical",
      fallbackUrl:
        "https://play.google.com/store/apps/details?id=com.jiahleework.pical",
    });
  });

  it("creates App Store search links for iOS", () => {
    expect(getAppUpdateStoreLinks("ios")).toEqual({
      deepLink:
        "itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/search?term=Pical",
      fallbackUrl: "https://apps.apple.com/kr/search?term=Pical",
    });
  });
});
