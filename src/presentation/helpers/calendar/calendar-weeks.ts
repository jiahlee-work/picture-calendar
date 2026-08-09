import type { CalendarGridCell } from "@/application/services/calendar/calendar-grid";

export function toCalendarWeeks(cells: CalendarGridCell[]) {
  return Array.from({ length: Math.ceil(cells.length / 7) }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );
}
