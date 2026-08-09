import { describe, expect, it } from "vitest";

import { toRecapMonthKeyParam } from "@/application/services/recap/recap-route-params";

describe("toRecapMonthKeyParam", () => {
  it("returns a valid month key from a route parameter", () => {
    expect(toRecapMonthKeyParam("2026-07")).toBe("2026-07");
    expect(toRecapMonthKeyParam(["2026-07", "2026-08"])).toBe("2026-07");
  });

  it("rejects missing and invalid month keys", () => {
    expect(toRecapMonthKeyParam(undefined)).toBeNull();
    expect(toRecapMonthKeyParam("2026-13")).toBeNull();
    expect(toRecapMonthKeyParam("July")).toBeNull();
  });
});
