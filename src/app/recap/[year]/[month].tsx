import { useLocalSearchParams } from "expo-router";

import { RecapMonthDetailScreen } from "@/presentation/features/recap/recap-month-detail-screen";

export default function RecapMonthDetailRoute() {
  const { month, year } = useLocalSearchParams<{ month: string; year: string }>();

  return <RecapMonthDetailScreen month={month} year={year} />;
}
