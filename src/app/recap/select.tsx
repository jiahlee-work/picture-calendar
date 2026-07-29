import { useLocalSearchParams } from "expo-router";

import { RecapPhotoSelectionScreen } from "@/presentation/features/recap/recap-photo-selection-screen";
import { toRecapMonthKeyParam } from "@/application/services/recap/recap-route-params";
import { dayjs } from "@/shared/date/dayjs";

export default function RecapPhotoSelectionRoute() {
  const { month } = useLocalSearchParams<{ month?: string | string[] }>();
  const monthKey =
    toRecapMonthKeyParam(month) ??
    dayjs().subtract(1, "month").format("YYYY-MM");

  return <RecapPhotoSelectionScreen monthKey={monthKey} />;
}
