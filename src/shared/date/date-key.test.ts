import { describe, expect, it } from "vitest";

import { toDateKey, toMonthKey } from "@/shared/date/date-key";
import { dayjs } from "@/shared/date/dayjs";

describe("date keys", () => {
  it("formats app date keys with zero-padded local date parts", () => {
    const date = dayjs("2026-04-09").toDate();

    expect(toDateKey(date)).toBe("2026-04-09");
    expect(toMonthKey(date)).toBe("2026-04");
  });
});
