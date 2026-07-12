import type { Dayjs } from "dayjs";

import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { CalendarCollageRecapTemplate } from "@/presentation/components/organisms/calendar-collage-recap-template";
import { MessageRecapTemplate } from "@/presentation/components/organisms/message-recap-template";
import {
  MonthlyRecapTemplateId,
  type MonthlyRecap,
} from "@/shared/recap/types";

type MonthlyRecapTemplateProps = {
  monthDate: Dayjs;
  photos: DailyPhoto[];
  recap: MonthlyRecap;
  width: number;
};

export function MonthlyRecapTemplate(props: MonthlyRecapTemplateProps) {
  const { monthDate, photos, recap, width } = props;

  if (recap.templateId === MonthlyRecapTemplateId.message) {
    return (
      <MessageRecapTemplate
        monthDate={monthDate}
        photos={photos}
        recap={recap}
        width={width}
      />
    );
  }

  return (
    <CalendarCollageRecapTemplate
      monthDate={monthDate}
      photos={photos}
      recap={recap}
      width={width}
    />
  );
}
