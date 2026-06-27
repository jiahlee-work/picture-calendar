import { useLocalSearchParams } from "expo-router";

import { RecapMonthDetailScreen } from "@/presentation/features/recap/RecapMonthDetailScreen";

export default function RecapMonthDetailRoute() {
  const { month, year } = useLocalSearchParams<{ month: string; year: string }>();

  return <RecapMonthDetailScreen month={month} year={year} />;
}
