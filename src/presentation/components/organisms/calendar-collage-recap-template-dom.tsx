import type { Dayjs } from "dayjs";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import {
  getCalendarRecapCardSize,
  getCalendarRecapPhotoSlotLayout,
} from "@/application/services/recap/monthly-recap-template-layout";
import { resolveMonthlyRecapTemplatePhotos } from "@/application/services/recap/monthly-recap-template-photos";
import { MonthlyRecapDomImage } from "@/presentation/components/atoms/monthly-recap-dom-image";
import { MonthlyRecapDomBackgroundCollage } from "@/presentation/components/molecules/monthly-recap-dom-background-collage";
import { MonthlyRecapDomCalendarGrid } from "@/presentation/components/molecules/monthly-recap-dom-calendar-grid";
import { MonthlyRecapDomPhotoFrame } from "@/presentation/components/molecules/monthly-recap-dom-photo-frame";
import type { MonthlyRecap } from "@/shared/recap/types";

type CalendarCollageRecapTemplateDomProps = {
  monthDate: Dayjs;
  photos: DailyPhoto[];
  recap: MonthlyRecap;
  width: number;
};

export function CalendarCollageRecapTemplateDom(props: CalendarCollageRecapTemplateDomProps) {
  const { monthDate, photos, recap, width } = props;
  const { backgroundPhotos, calendarPhotos } = resolveMonthlyRecapTemplatePhotos({ photos, recap });
  const calendar = buildCalendarMonth(monthDate.startOf("month").toDate());
  const calendarCardSize = getCalendarRecapCardSize(width);

  return (
    <div
      className="relative h-full flex-1 overflow-hidden bg-[#e8e4db] font-sans"
      style={{
        width,
      }}
    >
      <MonthlyRecapDomBackgroundCollage photos={backgroundPhotos} />
      <div className="absolute inset-0 bg-black/18" />
      <div className="absolute inset-0 z-[4] flex items-center justify-center">
        <div className="relative flex items-center justify-start overflow-visible" style={calendarCardSize}>
          <div className="rounded-[18px] bg-[rgba(255,255,252,0.94)] p-4" style={calendarCardSize}>
            <div className="mb-2.5 text-[29px] font-black leading-[34px] tracking-normal text-[#121212]">
              {monthDate.format("MMMM")}
            </div>
            <MonthlyRecapDomCalendarGrid cells={calendar.days} />
          </div>
          <div className="pointer-events-none absolute inset-0 overflow-visible">
            {calendarPhotos.map((photo, index) => (
              <MonthlyRecapDomPhotoFrame
                key={photo.id}
                className="border-8 border-[#fffdfa] bg-[#fffdfa] shadow-[0_6px_14px_rgba(0,0,0,0.16)]"
                layout={getCalendarRecapPhotoSlotLayout(index, calendarPhotos.length, width)}
              >
                <MonthlyRecapDomImage src={photo.imagePath} />
              </MonthlyRecapDomPhotoFrame>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
