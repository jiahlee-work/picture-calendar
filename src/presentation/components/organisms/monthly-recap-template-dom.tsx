"use dom";

import "@/presentation/styles/dom-tailwind.css";

import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { CalendarCollageRecapTemplateDom } from "@/presentation/components/organisms/calendar-collage-recap-template-dom";
import { MessageRecapTemplateDom } from "@/presentation/components/organisms/message-recap-template-dom";
import { dayjs } from "@/shared/date/dayjs";
import { MonthlyRecapTemplateId, type MonthlyRecap } from "@/shared/recap/types";

type MonthlyRecapTemplateDomProps = {
  dom?: import("expo/dom").DOMProps;
  monthKey: string;
  photos: DailyPhoto[];
  recap: MonthlyRecap;
  width: number;
};

const GLOBAL_CSS = `
html,
body,
#root {
  height: 100%;
  margin: 0;
  overflow: hidden;
  width: 100%;
}

* {
  box-sizing: border-box;
}
`;

export default function MonthlyRecapTemplateDom(props: MonthlyRecapTemplateDomProps) {
  const { monthKey, photos, recap, width } = props;
  const monthDate = dayjs(`${monthKey}-01`);

  if (recap.templateId === MonthlyRecapTemplateId.message) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <MessageRecapTemplateDom monthDate={monthDate} photos={photos} recap={recap} width={width} />
      </>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <CalendarCollageRecapTemplateDom monthDate={monthDate} photos={photos} recap={recap} width={width} />
    </>
  );
}
