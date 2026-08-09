import { dayjs } from "@/shared/date/dayjs";

export function toRecapMonthKeyParam(
  value: string | string[] | undefined,
): string | null {
  const month = Array.isArray(value) ? value[0] : value;

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return null;
  }

  const parsed = dayjs(`${month}-01`);

  return parsed.isValid() && parsed.format("YYYY-MM") === month ? month : null;
}
