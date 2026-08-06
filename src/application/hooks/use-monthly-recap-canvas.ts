import { useCallback, useEffect, useMemo, useState } from "react";

import { createMonthlyRecapCanvasRepositoryForRuntime } from "@/application/services/recap/monthly-recap-canvas-repository-factory";
import { LOCAL_USER_ID } from "@/application/services/local-user";
import { runtimePlatform } from "@/infrastructure/device/runtime-platform";
import { logger } from "@/infrastructure/logging/logger";
import type {
  MonthlyRecapCanvas,
  MonthlyRecapCanvasDraft,
} from "@/shared/recap/types";

type MonthlyRecapCanvasState = {
  canvas: MonthlyRecapCanvas | null;
  isLoading: boolean;
  isSaving: boolean;
};

export function useMonthlyRecapCanvas(monthKey: string) {
  const repository = useMemo(
    () => createMonthlyRecapCanvasRepositoryForRuntime(runtimePlatform),
    [],
  );
  const [state, setState] = useState<MonthlyRecapCanvasState>({
    canvas: null,
    isLoading: true,
    isSaving: false,
  });

  useEffect(() => {
    let isMounted = true;

    const loadCanvas = async () => {
      setState((current) => ({ ...current, isLoading: true }));

      try {
        const canvas = await repository.getByMonth(LOCAL_USER_ID, monthKey);

        if (isMounted) {
          setState((current) => ({
            ...current,
            canvas,
            isLoading: false,
          }));
        }
      } catch (error) {
        logger.error("Failed to load monthly recap canvas", {
          error,
          monthKey,
        });

        if (isMounted) {
          setState((current) => ({ ...current, isLoading: false }));
        }
      }
    };

    void loadCanvas();

    return () => {
      isMounted = false;
    };
  }, [monthKey, repository]);

  const saveCanvas = useCallback(
    async (draft: Omit<MonthlyRecapCanvasDraft, "month" | "userId">) => {
      setState((current) => ({ ...current, isSaving: true }));

      try {
        const canvas = await repository.save({
          ...draft,
          month: monthKey,
          userId: LOCAL_USER_ID,
        });

        setState((current) => ({
          ...current,
          canvas,
          isSaving: false,
        }));

        return canvas;
      } catch (error) {
        logger.error("Failed to save monthly recap canvas", {
          error,
          monthKey,
        });

        setState((current) => ({ ...current, isSaving: false }));
        throw error;
      }
    },
    [monthKey, repository],
  );

  return {
    ...state,
    saveCanvas,
  };
}
