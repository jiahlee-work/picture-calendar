import { useCallback, useEffect, useMemo, useState } from "react";

import { LOCAL_USER_ID } from "@/application/services/local-user";
import {
  cloneStickerPlacements,
  deleteStickerPlacement,
  resolveStickerPlacementDraftUpdate,
  type StickerPlacementDraftUpdater,
  type StickerPlacementUpdate,
  updateStickerPlacement,
  upsertStickerPlacement,
} from "@/application/services/stickers/sticker-placement-draft";
import { createStickerPlacementRepositoryForRuntime } from "@/application/services/stickers/sticker-placement-repository-factory";
import type {
  StickerPlacement,
  StickerPlacementPageType,
  StickerPlacementRepository,
} from "@/application/services/stickers/types";
import { runtimePlatform } from "@/infrastructure/device/runtime-platform";
import { logger } from "@/infrastructure/logging/logger";

export const StickerDecoratingCanvasStatus = {
  error: "error",
  loading: "loading",
  ready: "ready",
} as const;

export type StickerDecoratingCanvasStatus =
  (typeof StickerDecoratingCanvasStatus)[keyof typeof StickerDecoratingCanvasStatus];

type UseStickerDecoratingCanvasOptions = {
  pageId: string;
  pageType: StickerPlacementPageType;
  repository?: StickerPlacementRepository;
  userId?: string;
};

type StickerDecoratingCanvasState = {
  draftPlacements: StickerPlacement[] | null;
  isSaving: boolean;
  savedPlacements: StickerPlacement[];
  status: StickerDecoratingCanvasStatus;
};

export function useStickerDecoratingCanvas(
  options: UseStickerDecoratingCanvasOptions,
) {
  const {
    pageId,
    pageType,
    repository: configuredRepository,
    userId = LOCAL_USER_ID,
  } = options;
  const runtimeRepository = useMemo(
    () => createStickerPlacementRepositoryForRuntime(runtimePlatform),
    [],
  );
  const repository = configuredRepository ?? runtimeRepository;
  const [state, setState] = useState<StickerDecoratingCanvasState>({
    draftPlacements: null,
    isSaving: false,
    savedPlacements: [],
    status: StickerDecoratingCanvasStatus.loading,
  });
  const isDecorating = state.draftPlacements !== null;
  const placements = state.draftPlacements ?? state.savedPlacements;

  useEffect(() => {
    let isMounted = true;

    const loadPlacements = async () => {
      setState((current) => ({
        ...current,
        draftPlacements: null,
        status: StickerDecoratingCanvasStatus.loading,
      }));

      try {
        const loadedPlacements = await repository.listByPage(
          userId,
          pageType,
          pageId,
        );

        if (!isMounted) {
          return;
        }

        setState((current) => ({
          ...current,
          draftPlacements: null,
          savedPlacements: cloneStickerPlacements(loadedPlacements),
          status: StickerDecoratingCanvasStatus.ready,
        }));
      } catch (error) {
        logger.error("Failed to load sticker placements", {
          pageId,
          pageType,
          error,
        });

        if (!isMounted) {
          return;
        }

        setState((current) => ({
          ...current,
          draftPlacements: null,
          savedPlacements: [],
          status: StickerDecoratingCanvasStatus.error,
        }));
      }
    };

    void loadPlacements();

    return () => {
      isMounted = false;
    };
  }, [pageId, pageType, repository, userId]);

  const startDecorating = useCallback(() => {
    setState((current) => ({
      ...current,
      draftPlacements: cloneStickerPlacements(current.savedPlacements),
    }));
  }, []);

  const cancelDecorating = useCallback(() => {
    setState((current) => ({
      ...current,
      draftPlacements: null,
    }));
  }, []);

  const replaceDraftPlacements = useCallback(
    (updater: StickerPlacementDraftUpdater) => {
      setState((current) => {
        if (!current.draftPlacements) {
          return current;
        }

        return {
          ...current,
          draftPlacements: resolveStickerPlacementDraftUpdate(
            current.draftPlacements,
            updater,
          ),
        };
      });
    },
    [],
  );

  const addDraftPlacement = useCallback((placement: StickerPlacement) => {
    setState((current) => {
      if (!current.draftPlacements) {
        return current;
      }

      return {
        ...current,
        draftPlacements: upsertStickerPlacement(
          current.draftPlacements,
          placement,
        ),
      };
    });
  }, []);

  const updateDraftPlacement = useCallback(
    (placementId: string, update: StickerPlacementUpdate) => {
      setState((current) => {
        if (!current.draftPlacements) {
          return current;
        }

        return {
          ...current,
          draftPlacements: updateStickerPlacement(
            current.draftPlacements,
            placementId,
            update,
          ),
        };
      });
    },
    [],
  );

  const deleteDraftPlacement = useCallback((placementId: string) => {
    setState((current) => {
      if (!current.draftPlacements) {
        return current;
      }

      return {
        ...current,
        draftPlacements: deleteStickerPlacement(
          current.draftPlacements,
          placementId,
        ),
      };
    });
  }, []);

  const commitDecorating = useCallback(async (): Promise<boolean> => {
    if (!state.draftPlacements || state.isSaving) {
      return false;
    }

    const placementsToSave = cloneStickerPlacements(state.draftPlacements);

    setState((current) => ({
      ...current,
      isSaving: true,
    }));

    try {
      const savedPlacements = await repository.savePagePlacements(
        userId,
        pageType,
        pageId,
        placementsToSave,
      );

      setState((current) => ({
        ...current,
        draftPlacements: null,
        isSaving: false,
        savedPlacements: cloneStickerPlacements(savedPlacements),
        status: StickerDecoratingCanvasStatus.ready,
      }));

      return true;
    } catch (error) {
      logger.error("Failed to save sticker placements", {
        pageId,
        pageType,
        error,
      });

      setState((current) => ({
        ...current,
        isSaving: false,
        status: StickerDecoratingCanvasStatus.error,
      }));

      return false;
    }
  }, [
    pageId,
    pageType,
    repository,
    state.draftPlacements,
    state.isSaving,
    userId,
  ]);

  return {
    placements,
    savedPlacements: state.savedPlacements,
    draftPlacements: state.draftPlacements,
    status: state.status,
    isDecorating,
    isLoading: state.status === StickerDecoratingCanvasStatus.loading,
    isSaving: state.isSaving,
    addDraftPlacement,
    cancelDecorating,
    commitDecorating,
    deleteDraftPlacement,
    replaceDraftPlacements,
    startDecorating,
    updateDraftPlacement,
  };
}
