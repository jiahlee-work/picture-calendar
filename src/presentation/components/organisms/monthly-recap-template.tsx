import type { Dayjs } from "dayjs";

import type { DailyPhoto } from "@/application/services/daily-photo/types";
import MonthlyRecapTemplateDom from "@/presentation/components/organisms/monthly-recap-template-dom";
import type { MonthlyRecap } from "@/shared/recap/types";

type MonthlyRecapTemplateProps = {
  monthDate: Dayjs;
  photos: DailyPhoto[];
  recap: MonthlyRecap;
  width: number;
};

export function MonthlyRecapTemplate(props: MonthlyRecapTemplateProps) {
  const { monthDate, photos, recap, width } = props;

  return (
    <MonthlyRecapTemplateDom
      dom={{
        contentInsetAdjustmentBehavior: "never",
        scrollEnabled: false,
        style: {
          flex: 1,
        },
      }}
      monthKey={monthDate.format("YYYY-MM")}
      photos={photos}
      recap={recap}
      width={width}
    />
  );
}
