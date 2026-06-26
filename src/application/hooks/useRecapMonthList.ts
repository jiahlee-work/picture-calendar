import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { createLocalDailyPhotoMetadataStore } from "@/infrastructure/persistence/daily-photo/local-daily-photo-metadata-store";
import { createLocalDailyPhotoRepository } from "@/infrastructure/persistence/daily-photo/local-daily-photo-repository";
import { toMonthKey } from "@/shared/date/date-key";
import { dayjs } from "@/shared/date/dayjs";
import type { DailyPhotoRepository } from "@/shared/daily-photo/types";

const localUserId = "local-user";
const monthCount = 12;

export type RecapMonthSummary = {
  month: string;
  monthLabel: string;
  photoCount: number;
  previewPhotos: DailyPhoto[];
};

export function useRecapMonthList(year = dayjs().year()) {
  const [months, setMonths] = useState<RecapMonthSummary[]>(() => createEmptyRecapMonths(year));
  const repository = useMemo(createDailyPhotoRepository, []);

  useEffect(() => {
    let isMounted = true;

    const loadMonths = async () => {
      const nextMonths = await Promise.all(
        createEmptyRecapMonths(year).map(async (month) => {
          const photos = await repository.listByMonth(localUserId, month.month);

          return {
            ...month,
            photoCount: photos.length,
            previewPhotos: photos.slice(0, 4),
          };
        }),
      );

      if (isMounted) {
        setMonths(nextMonths);
      }
    };

    void loadMonths();

    return () => {
      isMounted = false;
    };
  }, [repository, year]);

  return {
    months,
    year,
  };
}

function createEmptyRecapMonths(year: number): RecapMonthSummary[] {
  return Array.from({ length: monthCount }, (_, index) => {
    const monthDate = dayjs(`${year}-${String(index + 1).padStart(2, "0")}-01`).toDate();

    return {
      month: toMonthKey(monthDate),
      monthLabel: dayjs(monthDate).format("MMMM"),
      photoCount: 0,
      previewPhotos: [],
    };
  });
}

function createDailyPhotoRepository(): DailyPhotoRepository {
  if (Platform.OS === "web") {
    return createLocalDailyPhotoRepository();
  }

  return createLocalDailyPhotoRepository({
    metadataStore: createLocalDailyPhotoMetadataStore(),
  });
}
