import { dayjs } from "@/shared/date/dayjs";

export function toDateKey(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}

export function toMonthKey(date: Date): string {
  return dayjs(date).format("YYYY-MM");
}
