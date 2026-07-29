import { describe, expect, it } from "vitest";

import {
  getAppBottomNavigationActiveIndex,
  getAppBottomNavigationAnimationDuration,
  getAppBottomNavigationItemLayout,
} from "@/presentation/helpers/navigation/app-bottom-navigation-layout";
import type { AppBottomNavigationRoute } from "@/presentation/helpers/navigation/app-bottom-navigation-routes";

const ROUTES: AppBottomNavigationRoute[] = [
  "/",
  "/recap",
  "/stickers",
  "/settings",
];

describe("app bottom navigation layout", () => {
  it("resolves the active route index", () => {
    expect(getAppBottomNavigationActiveIndex(ROUTES, "/stickers")).toBe(2);
  });

  it("falls back to the first index when the route is missing", () => {
    expect(getAppBottomNavigationActiveIndex([], "/settings")).toBe(0);
  });

  it("returns the measured item layout for an index", () => {
    expect(
      getAppBottomNavigationItemLayout(
        [{ left: 6, width: 72 }, { left: 82, width: 72 }, null],
        1,
      ),
    ).toEqual({ left: 82, width: 72 });
  });

  it("increases animation duration for longer moves", () => {
    expect(
      getAppBottomNavigationAnimationDuration({
        fromIndex: 0,
        maxDurationMs: 260,
        minDurationMs: 140,
        stepDurationMs: 42,
        toIndex: 1,
      }),
    ).toBe(182);
    expect(
      getAppBottomNavigationAnimationDuration({
        fromIndex: 0,
        maxDurationMs: 260,
        minDurationMs: 140,
        stepDurationMs: 42,
        toIndex: 3,
      }),
    ).toBe(260);
  });
});
