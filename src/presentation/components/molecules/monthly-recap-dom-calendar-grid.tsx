import type { CalendarGridCell } from "@/application/services/calendar/calendar-grid";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

type MonthlyRecapDomCalendarGridProps = {
  cells: CalendarGridCell[];
};

export function MonthlyRecapDomCalendarGrid(props: MonthlyRecapDomCalendarGridProps) {
  const { cells } = props;

  return (
    <div className="flex flex-wrap">
      {WEEKDAYS.map((weekday, index) => (
        <div
          key={`${weekday}-${index}`}
          className="w-[14.285714%] text-center text-[11px] font-extrabold leading-4 text-[#6f6f6f]"
        >
          {weekday}
        </div>
      ))}
      {cells.map((cell, index) => (
        <div
          key={cell?.key ?? `empty-${index}`}
          className="flex h-[27px] w-[14.285714%] items-center justify-center border-t border-[rgba(18,18,18,0.12)]"
        >
          {cell ? <span className="text-[13px] font-bold leading-[18px] text-[#121212]">{cell.dayOfMonth}</span> : null}
        </div>
      ))}
    </div>
  );
}
