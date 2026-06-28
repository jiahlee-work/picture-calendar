import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import { createDailyPhotoRepositoryForRuntime } from "@/application/services/daily-photo/daily-photo-repository-factory";
import { isDisplayableDailyPhoto, toPhotosByDate } from "@/application/services/daily-photo/daily-photo-records";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { createMonthlyRecapRepositoryForRuntime } from "@/application/services/recap/monthly-recap-repository-factory";
import {
  applyMonthlyRecapSelectionLimit,
  monthlyRecapSelectionLimit,
  toggleMonthlyRecapSelectedPhotoId,
} from "@/application/services/recap/recap-selection";
import { logger } from "@/infrastructure/logging/logger";
import { dayjs } from "@/shared/date/dayjs";

const localUserId = "local-user";

export type MonthlyRecapSelectionResult = "selected" | "selection_limit_reached" | "missing_photo";

export function useMonthlyRecapSelection(monthKey: string, today = dayjs().toDate()) {
  const [photosByDate, setPhotosByDate] = useState<Record<string, DailyPhoto>>({});
  const [savedSelectedPhotoIds, setSavedSelectedPhotoIds] = useState<string[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [selectedPhotoDateKey, setSelectedPhotoDateKey] = useState<string | null>(null);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const activeMonth = useMemo(() => dayjs(`${monthKey}-01`).startOf("month").toDate(), [monthKey]);
  const dailyPhotoRepository = useMemo(() => createDailyPhotoRepositoryForRuntime(Platform.OS), []);
  const recapRepository = useMemo(() => createMonthlyRecapRepositoryForRuntime(Platform.OS), []);
  const calendar = useMemo(() => buildCalendarMonth(activeMonth, today, photosByDate), [activeMonth, photosByDate, today]);
  const selectedPhotoIdsSet = useMemo(() => new Set(selectedPhotoIds), [selectedPhotoIds]);
  const selectedDateKeys = useMemo(
    () =>
      selectedPhotoIds.flatMap((photoId) => {
        const selectedPhoto = Object.values(photosByDate).find((photo) => photo.id === photoId);

        return selectedPhoto ? [selectedPhoto.date] : [];
      }),
    [photosByDate, selectedPhotoIds],
  );
  const selectedPhoto = selectedPhotoDateKey ? photosByDate[selectedPhotoDateKey] ?? null : null;
  const photoDetail = selectedPhotoDateKey && selectedPhoto
    ? {
      dateLabel: dayjs(selectedPhotoDateKey).format("YYYY.MM.DD"),
      isToday: false,
      photo: selectedPhoto,
    }
    : null;

  useEffect(() => {
    let isMounted = true;

    const loadSelection = async () => {
      setIsLoading(true);
      setHasLoadFailed(false);

      try {
        const monthPhotos = await dailyPhotoRepository.listByMonth(localUserId, monthKey);
        const displayablePhotos = monthPhotos.filter(isDisplayableDailyPhoto);
        const displayablePhotoIds = new Set(displayablePhotos.map((photo) => photo.id));
        const recap = await recapRepository.getByMonth(localUserId, monthKey);
        const nextSelectedPhotoIds = applyMonthlyRecapSelectionLimit(
          recap?.selectedPhotoIds.filter((photoId) => displayablePhotoIds.has(photoId)) ?? [],
        );

        if (!isMounted) {
          return;
        }

        setPhotosByDate(toPhotosByDate(displayablePhotos));
        setSavedSelectedPhotoIds(nextSelectedPhotoIds);
        setSelectedPhotoIds(nextSelectedPhotoIds);
        setSelectedPhotoDateKey(null);
        setIsLoading(false);
      } catch (error) {
        logger.error("Failed to load monthly recap selection", { monthKey, error });

        if (!isMounted) {
          return;
        }

        setPhotosByDate({});
        setSavedSelectedPhotoIds([]);
        setSelectedPhotoIds([]);
        setSelectedPhotoDateKey(null);
        setHasLoadFailed(true);
        setIsLoading(false);
      }
    };

    void loadSelection();

    return () => {
      isMounted = false;
    };
  }, [dailyPhotoRepository, monthKey, recapRepository]);

  const handleOpenPhotoDetail = useCallback((dateKey: string) => {
    const photo = photosByDate[dateKey] ?? null;

    if (!photo) {
      setSelectedPhotoDateKey(null);
      return;
    }

    setSelectedPhotoDateKey(dateKey);
  }, [photosByDate]);

  const handleTogglePhotoSelection = useCallback((dateKey: string): MonthlyRecapSelectionResult => {
    const photo = photosByDate[dateKey] ?? null;

    if (!photo) {
      return "missing_photo";
    }

    const isSelected = selectedPhotoIdsSet.has(photo.id);

    if (!isSelected && selectedPhotoIds.length >= monthlyRecapSelectionLimit) {
      return "selection_limit_reached";
    }

    setSelectedPhotoIds((current) => toggleMonthlyRecapSelectedPhotoId(current, photo.id));
    return "selected";
  }, [photosByDate, selectedPhotoIds.length, selectedPhotoIdsSet]);

  const handleSaveSelection = useCallback(async () => {
    const savedRecap = await recapRepository.saveSelection({
      userId: localUserId,
      month: monthKey,
      selectedPhotoIds,
    });

    setSavedSelectedPhotoIds(savedRecap.selectedPhotoIds);

    return savedRecap;
  }, [monthKey, recapRepository, selectedPhotoIds]);

  const handleResetSelection = useCallback(() => {
    setSelectedPhotoIds(savedSelectedPhotoIds);
  }, [savedSelectedPhotoIds]);

  const dismissPhotoDetail = useCallback(() => {
    setSelectedPhotoDateKey(null);
  }, []);

  return {
    calendar,
    dismissPhotoDetail,
    hasLoadFailed,
    handleOpenPhotoDetail,
    handleResetSelection,
    handleSaveSelection,
    handleTogglePhotoSelection,
    isLoading,
    photoDetail,
    selectedDateKeys,
    selectedPhotoCount: selectedPhotoIds.length,
    selectionLimit: monthlyRecapSelectionLimit,
  };
}
