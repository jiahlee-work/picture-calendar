import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { createDailyPhotoRepositoryForRuntime } from "@/application/services/daily-photo/daily-photo-repository-factory";
import {
  createRecapMonthSummaries,
  createRecapYearMonths,
  createRecapYearOptions,
} from "@/application/services/recap/recap-month-list";
import { dayjs } from "@/shared/date/dayjs";

const localUserId = "local-user";

type UseRecapMonthListOptions = {
  initialYear?: number;
};

export function useRecapMonthList(options: UseRecapMonthListOptions = {}) {
  const { initialYear = dayjs().year() } = options;
  const repository = useMemo(() => createDailyPhotoRepositoryForRuntime(Platform.OS), []);
  const yearOptions = useMemo(() => createRecapYearOptions(initialYear), [initialYear]);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [months, setMonths] = useState(() => createRecapYearMonths(initialYear));

  useEffect(() => {
    let isMounted = true;

    const loadMonths = async () => {
      const nextMonths = await createRecapMonthSummaries({
        repository,
        userId: localUserId,
        year: selectedYear,
      });

      if (isMounted) {
        setMonths(nextMonths);
      }
    };

    void loadMonths();

    return () => {
      isMounted = false;
    };
  }, [repository, selectedYear]);

  return {
    months,
    selectedYear,
    selectYear: setSelectedYear,
    yearOptions,
  };
}
