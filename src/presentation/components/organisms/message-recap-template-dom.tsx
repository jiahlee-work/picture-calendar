import type { Dayjs } from "dayjs";

import type { DailyPhoto } from "@/application/services/daily-photo/types";
import {
  getMessageRecapPhotoFrameLayout,
  getMessageRecapPhotoGroupSize,
  getMonthlyRecapSeasonEmojis,
} from "@/application/services/recap/monthly-recap-template-layout";
import { resolveMonthlyRecapTemplatePhotos } from "@/application/services/recap/monthly-recap-template-photos";
import { MonthlyRecapDomImage } from "@/presentation/components/atoms/monthly-recap-dom-image";
import { MonthlyRecapDomPhotoFrame } from "@/presentation/components/molecules/monthly-recap-dom-photo-frame";
import { dayjs } from "@/shared/date/dayjs";
import type { MonthlyRecap } from "@/shared/recap/types";

const MESSAGE_CANVAS_HORIZONTAL_PADDING = 16;

type MessageRecapTemplateDomProps = {
  monthDate: Dayjs;
  photos: DailyPhoto[];
  recap: MonthlyRecap;
  width: number;
};

export function MessageRecapTemplateDom(props: MessageRecapTemplateDomProps) {
  const { monthDate, photos, recap, width } = props;
  const { selectedPhotos } = resolveMonthlyRecapTemplatePhotos({ photos, recap });
  const createdTimeLabel = dayjs(recap.createdAt).isValid() ? dayjs(recap.createdAt).format("HH:mm") : "09:00";
  const contentWidth = Math.max(0, width - MESSAGE_CANVAS_HORIZONTAL_PADDING * 2);
  const photoGroupSize = getMessageRecapPhotoGroupSize(selectedPhotos.length, contentWidth);

  return (
    <div
      className="relative flex h-full flex-1 flex-col justify-start gap-[72px] overflow-hidden bg-white px-4 pb-16 pt-[118px] font-sans"
      style={{
        width,
      }}
    >
      <div className="z-[4] self-center text-center text-[15px] font-bold leading-5 tracking-normal text-[#686868]">
        TODAY AT {createdTimeLabel}
      </div>
      <div className="flex flex-col gap-5">
        <div className="relative shrink-0 overflow-visible" style={photoGroupSize}>
          {selectedPhotos.map((photo, index) => (
            <MonthlyRecapDomPhotoFrame
              key={photo.id}
              className="rounded-3xl bg-[#eeeeee]"
              layout={getMessageRecapPhotoFrameLayout(index, selectedPhotos.length, contentWidth)}
            >
              <MonthlyRecapDomImage src={photo.imagePath} />
            </MonthlyRecapDomPhotoFrame>
          ))}
        </div>
        <div className="relative z-10 min-h-[52px] max-w-[82%] self-end rounded-3xl bg-[#1688ff] px-5 py-3">
          <span className="text-base font-bold leading-[22px] tracking-normal text-white">
            My {monthDate.format("MMMM YYYY")} {getMonthlyRecapSeasonEmojis(monthDate.month())}
          </span>
          <div className="absolute bottom-0 right-[-7px] h-[25px] w-5 rounded-bl-2xl bg-[#1688ff]" />
          <div className="absolute bottom-0 right-[-26px] h-[25px] w-[26px] rounded-bl-[10px] bg-white" />
        </div>
      </div>
    </div>
  );
}
