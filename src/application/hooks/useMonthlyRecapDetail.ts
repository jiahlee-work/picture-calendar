import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { createDailyPhotoRepositoryForRuntime } from "@/application/services/daily-photo/daily-photo-repository-factory";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import {
  createAutoMonthlyRecapDraft,
  shouldRefreshAutoMonthlyRecap,
} from "@/application/services/recap/monthly-recap-layout";
import { createMonthlyRecapRepositoryForRuntime } from "@/application/services/recap/monthly-recap-repository-factory";
import { sortRecapMonthPhotos } from "@/application/services/recap/monthly-recap-photos";
import { logger } from "@/infrastructure/logging/logger";
import type { MonthlyRecap } from "@/shared/recap/types";

const localUserId = "local-user";

export type MonthlyRecapDetailStatus = "loading" | "ready" | "empty" | "needs_selection" | "error";

type MonthlyRecapDetailState = {
  photos: DailyPhoto[];
  recap: MonthlyRecap | null;
  status: MonthlyRecapDetailStatus;
};

export function useMonthlyRecapDetail(monthKey: string) {
  const dailyPhotoRepository = useMemo(() => createDailyPhotoRepositoryForRuntime(Platform.OS), []);
  const recapRepository = useMemo(() => createMonthlyRecapRepositoryForRuntime(Platform.OS), []);
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
        const monthPhotos = sortRecapMonthPhotos(await dailyPhotoRepository.listByMonth(localUserId, monthKey));
        const photoIds = monthPhotos.map((photo) => photo.id);
        const photoIdsSet = new Set(photoIds);
        const savedRecap = await recapRepository.getByMonth(localUserId, monthKey);
        const savedSelectedPhotoIds = savedRecap?.selectionStatus === "selected"
          ? savedRecap.selectedPhotoIds.filter((photoId) => photoIdsSet.has(photoId))
          : [];

        if (!isMounted) {
          return;
        }

        if (monthPhotos.length === 0) {
          setState({
            photos: [],
            recap: null,
            status: "empty",
          });
          return;
        }

        if (monthPhotos.length >= 10 && savedSelectedPhotoIds.length === 0) {
          setState({
            photos: monthPhotos,
            recap: savedRecap,
            status: "needs_selection",
          });
          return;
        }

        const canUseSavedRecap = savedRecap?.selectionStatus === "selected"
          && savedSelectedPhotoIds.length > 0
          && !shouldRefreshAutoMonthlyRecap({
            photoIds,
            selectedPhotoIds: savedSelectedPhotoIds,
          });

        if (canUseSavedRecap) {
          setState({
            photos: monthPhotos,
            recap: savedRecap,
            status: "ready",
          });
          return;
        }

        const draft = createAutoMonthlyRecapDraft({
          userId: localUserId,
          month: monthKey,
          photoIds,
        });

        if (!draft) {
          setState({
            photos: monthPhotos,
            recap: savedRecap,
            status: "needs_selection",
          });
          return;
        }

        const createdRecap = await recapRepository.saveSelection(draft);

        if (!isMounted) {
          return;
        }

        setState({
          photos: monthPhotos,
          recap: createdRecap,
          status: "ready",
        });
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
  }, [dailyPhotoRepository, monthKey, recapRepository]);

  return state;
}
