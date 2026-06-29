import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { createDailyPhotoRepositoryForRuntime } from "@/application/services/daily-photo/daily-photo-repository-factory";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import {
  loadMonthlyRecapDetail,
  MonthlyRecapDetailStatus as MonthlyRecapDetailStatusValue,
  type MonthlyRecapDetailStatus as MonthlyRecapDetailStatusType,
} from "@/application/services/recap/monthly-recap-detail";
import { createMonthlyRecapRepositoryForRuntime } from "@/application/services/recap/monthly-recap-repository-factory";
import { RecapAvailabilityMode } from "@/application/services/recap/recap-month-list";
import { logger } from "@/infrastructure/logging/logger";
import type { MonthlyRecap } from "@/shared/recap/types";

const LOCAL_USER_ID = "local-user";

export const MonthlyRecapDetailStatus = MonthlyRecapDetailStatusValue;
export type MonthlyRecapDetailStatus = MonthlyRecapDetailStatusType;

type MonthlyRecapDetailState = {
  photos: DailyPhoto[];
  recap: MonthlyRecap | null;
  status: MonthlyRecapDetailStatusType;
};

export function useMonthlyRecapDetail(monthKey: string) {
  const dailyPhotoRepository = useMemo(() => createDailyPhotoRepositoryForRuntime(Platform.OS), []);
  const recapRepository = useMemo(() => createMonthlyRecapRepositoryForRuntime(Platform.OS), []);
  const availabilityMode = __DEV__ ? RecapAvailabilityMode.development : RecapAvailabilityMode.production;
  const [state, setState] = useState<MonthlyRecapDetailState>({
    photos: [],
    recap: null,
    status: MonthlyRecapDetailStatus.loading,
  });

  useEffect(() => {
    let isMounted = true;

    const loadRecap = async () => {
      setState((current) => ({
        ...current,
        status: MonthlyRecapDetailStatus.loading,
      }));

      try {
        const nextState = await loadMonthlyRecapDetail({
          availabilityMode,
          dailyPhotoRepository,
          month: monthKey,
          recapRepository,
          userId: LOCAL_USER_ID,
        });

        if (!isMounted) {
          return;
        }

        setState(nextState);
      } catch (error) {
        logger.error("Failed to load monthly recap detail", { monthKey, error });

        if (!isMounted) {
          return;
        }

        setState({
          photos: [],
          recap: null,
          status: MonthlyRecapDetailStatus.error,
        });
      }
    };

    void loadRecap();

    return () => {
      isMounted = false;
    };
  }, [availabilityMode, dailyPhotoRepository, monthKey, recapRepository]);

  return state;
}
