import { useLocalSearchParams } from "expo-router";

import { RecapPhotoSelectionScreen } from "@/presentation/features/recap/recap-photo-selection-screen";
import { dayjs } from "@/shared/date/dayjs";

export default function RecapPhotoSelectionRoute() {
  const { month } = useLocalSearchParams<{ month?: string | string[] }>();
  const monthKey = toMonthKeyParam(month) ?? dayjs().subtract(1, "month").format("YYYY-MM");

  return <RecapPhotoSelectionScreen monthKey={monthKey} />;
}

function toMonthKeyParam(value: string | string[] | undefined): string | null {
  const month = Array.isArray(value) ? value[0] : value;

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return null;
  }

  const parsed = dayjs(`${month}-01`);

  return parsed.isValid() && parsed.format("YYYY-MM") === month ? month : null;
}
