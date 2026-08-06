import { useLocalSearchParams } from "expo-router";

import { RecapDecoratingScreen } from "@/presentation/features/recap/recap-decorating-screen";

export default function RecapMonthDetailRoute() {
  const { month, year } = useLocalSearchParams<{
    month: string;
    year: string;
  }>();

  return <RecapDecoratingScreen month={month} year={year} />;
}
