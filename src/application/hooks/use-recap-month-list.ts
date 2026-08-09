import { useEffect, useMemo, useState } from "react";
import { createDailyPhotoRepositoryForRuntime } from "@/application/services/daily-photo/daily-photo-repository-factory";
import { LOCAL_USER_ID } from "@/application/services/local-user";
import {
  createRecapMonthSummaries,
  createVisibleRecapYearMonths,
  createRecapYearOptions,
  RecapAvailabilityMode,
} from "@/application/services/recap/recap-month-list";
import { dayjs } from "@/shared/date/dayjs";
import { runtimePlatform } from "@/infrastructure/device/runtime-platform";

type UseRecapMonthListOptions = {
  initialYear?: number;
};

export function useRecapMonthList(options: UseRecapMonthListOptions = {}) {
  const { initialYear = dayjs().year() } = options;
  const dailyPhotoRepository = useMemo(
    () => createDailyPhotoRepositoryForRuntime(runtimePlatform),
    [],
  );
  const shouldIncludeMonthsBeforeStart = __DEV__;
  const availabilityMode = __DEV__
    ? RecapAvailabilityMode.development
    : RecapAvailabilityMode.production;
  const yearOptions = useMemo(
    () => createRecapYearOptions(initialYear),
    [initialYear],
  );
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [months, setMonths] = useState(() =>
    createVisibleRecapYearMonths({
      includeMonthsBeforeStart: shouldIncludeMonthsBeforeStart,
      year: initialYear,
    }),
  );

  useEffect(() => {
    let isMounted = true;

    const loadMonths = async () => {
      const nextMonths = await createRecapMonthSummaries({
        availabilityMode,
        includeMonthsBeforeStart: shouldIncludeMonthsBeforeStart,
        repository: dailyPhotoRepository,
        userId: LOCAL_USER_ID,
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
  }, [
    availabilityMode,
    dailyPhotoRepository,
    selectedYear,
    shouldIncludeMonthsBeforeStart,
  ]);

  return {
    months,
    selectedYear,
    selectYear: setSelectedYear,
    yearOptions,
  };
}
