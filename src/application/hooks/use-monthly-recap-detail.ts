import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { createDailyPhotoRepositoryForRuntime } from "@/application/services/daily-photo/daily-photo-repository-factory";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import {
  loadMonthlyRecapDetail,
  type MonthlyRecapDetailStatus as LoadedMonthlyRecapDetailStatus,
} from "@/application/services/recap/monthly-recap-detail";
import { createMonthlyRecapRepositoryForRuntime } from "@/application/services/recap/monthly-recap-repository-factory";
import { logger } from "@/infrastructure/logging/logger";
import type { MonthlyRecap } from "@/shared/recap/types";

const LOCAL_USER_ID = "local-user";

export type MonthlyRecapDetailStatus = LoadedMonthlyRecapDetailStatus | "loading" | "error";

type MonthlyRecapDetailState = {
  photos: DailyPhoto[];
  recap: MonthlyRecap | null;
  status: MonthlyRecapDetailStatus;
};

export function useMonthlyRecapDetail(monthKey: string) {
  const dailyPhotoRepository = useMemo(() => createDailyPhotoRepositoryForRuntime(Platform.OS), []);
  const recapRepository = useMemo(() => createMonthlyRecapRepositoryForRuntime(Platform.OS), []);
  const availabilityMode = __DEV__ ? "development" : "production";
  const [state, setState] = useState<MonthlyRecapDetailState>({
    photos: [],
    recap: null,
    status: "loading",
  });

  useEffect(() => {
    let isMounted = true;

    const loadRecap = async () => {
      setState((current) => ({
        ...current,
        status: "loading",
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
          status: "error",
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
