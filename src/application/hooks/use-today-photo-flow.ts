import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import { createDailyPhotoFileStoreForRuntime } from "@/application/services/daily-photo/daily-photo-file-store-factory";
import {
  dailyPhotoMessages,
  getDailyPhotoSelectionAction,
} from "@/application/services/daily-photo/daily-photo-policy";
import { toPhotosByDate } from "@/application/services/daily-photo/daily-photo-records";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { createDailyPhotoRepositoryForRuntime } from "@/application/services/daily-photo/daily-photo-repository-factory";
import { syncMonthlyRecapNotificationScheduleForRuntime } from "@/application/services/notifications/recap-notification-service";
import { waitForNextFrame } from "@/application/utils/frame";
import { pickImageFromLibrary } from "@/infrastructure/device/media/image-picker";
import { logger } from "@/infrastructure/logging/logger";
import { toDateKey, toMonthKey } from "@/shared/date/date-key";
import { dayjs } from "@/shared/date/dayjs";

const LOCAL_USER_ID = "local-user";

export type DailyPhotoPolicyDialogState =
  | { type: "none" }
  | { type: "info"; title: string; message: string };

export function useTodayPhotoFlow(activeMonth: Date, today = dayjs().toDate()) {
  const [photosByDate, setPhotosByDate] = useState<Record<string, DailyPhoto>>({});
  const [policyDialog, setPolicyDialog] = useState<DailyPhotoPolicyDialogState>({ type: "none" });
  const [selectedPhotoDateKey, setSelectedPhotoDateKey] = useState<string | null>(null);
  const fileStore = useMemo(() => createDailyPhotoFileStoreForRuntime(Platform.OS), []);
  const repository = useMemo(() => createDailyPhotoRepositoryForRuntime(Platform.OS), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const calendar = useMemo(() => buildCalendarMonth(activeMonth, today, photosByDate), [activeMonth, photosByDate, today]);
  const activeMonthKey = useMemo(() => toMonthKey(activeMonth), [activeMonth]);
  const selectedPhoto = selectedPhotoDateKey ? photosByDate[selectedPhotoDateKey] ?? null : null;
  const photoDetail = selectedPhotoDateKey && selectedPhoto
    ? {
      dateKey: selectedPhotoDateKey,
      dateLabel: dayjs(selectedPhotoDateKey).format("YYYY.MM.DD"),
      isToday: selectedPhotoDateKey === todayKey,
      photo: selectedPhoto,
    }
    : null;

  useEffect(() => {
    let isMounted = true;

    const loadMonthPhotos = async () => {
      const monthPhotos = await repository.listByMonth(LOCAL_USER_ID, activeMonthKey);

      if (!isMounted) {
        return;
      }

      setPhotosByDate((current) => ({
        ...current,
        ...toPhotosByDate(monthPhotos),
      }));
    };

    void loadMonthPhotos();

    return () => {
      isMounted = false;
    };
  }, [activeMonthKey, repository]);

  const handleSelectDate = async (dateKey: string) => {
    const photo = photosByDate[dateKey] ?? null;
    const selectionAction = getDailyPhotoSelectionAction(dateKey, todayKey, photo);

    setSelectedPhotoDateKey(null);

    if (selectionAction === "openDetail") {
      setSelectedPhotoDateKey(dateKey);
      return;
    }

    if (selectionAction === "showUnavailable") {
      setPolicyDialog({
        type: "info",
        title: "사진 추가 불가",
        message: dailyPhotoMessages.unavailable,
      });
      return;
    }

    await pickAndSavePhoto(dateKey);
  };

  const handleChangeSelectedPhoto = async () => {
    const dateKey = selectedPhotoDateKey;

    if (!dateKey || dateKey !== todayKey) {
      return;
    }

    setSelectedPhotoDateKey(null);
    await waitForNextFrame();
    await pickAndSavePhoto(dateKey);
  };

  const deleteStoredPhotoFile = async (storageKey: string, message: string) => {
    try {
      await fileStore.delete(storageKey);
    } catch (error) {
      logger.warn(message, { storageKey, error });
    }
  };

  const syncRecapNotificationSchedule = () => {
    void syncMonthlyRecapNotificationScheduleForRuntime(Platform.OS).catch((error: unknown) => {
      logger.warn("Failed to sync recap notification schedule after photo change", { error });
    });
  };

  const handleDeleteSelectedPhoto = async () => {
    const dateKey = selectedPhotoDateKey;

    if (!dateKey) {
      return;
    }

    setSelectedPhotoDateKey(null);
    await waitForNextFrame();

    const deletedPhoto = await repository.deleteByDate(LOCAL_USER_ID, dateKey);

    setPhotosByDate((current) => {
      const next = { ...current };

      delete next[dateKey];

      return next;
    });

    if (deletedPhoto?.storageKey) {
      await deleteStoredPhotoFile(deletedPhoto.storageKey, "Failed to delete daily photo file");
    }

    syncRecapNotificationSchedule();
  };

  const pickAndSavePhoto = async (dateKey: string) => {
    const pickedImage = await pickImageFromLibrary();

    if (!pickedImage) {
      return false;
    }

    return saveTodayPhoto({
      base64: pickedImage.base64,
      dateKey,
      fileName: pickedImage.fileName,
      mimeType: pickedImage.mimeType,
      sourceUri: pickedImage.uri,
    });
  };

  const saveTodayPhoto = async ({
    base64,
    dateKey,
    fileName,
    mimeType,
    sourceUri,
  }: {
    base64: string | null;
    dateKey: string;
    fileName: string | null;
    mimeType: string | null;
    sourceUri: string;
  }) => {
    let nextStoredFile: Awaited<ReturnType<typeof fileStore.save>> | null = null;

    try {
      const previousPhoto = photosByDate[dateKey] ?? null;
      nextStoredFile = await fileStore.save({
        userId: LOCAL_USER_ID,
        date: dateKey,
        fileName,
        base64,
        mimeType,
        sourceUri,
      });
      const savedPhoto = await repository.saveToday({
        userId: LOCAL_USER_ID,
        date: dateKey,
        ...nextStoredFile,
      });

      const monthPhotos = await repository.listByMonth(LOCAL_USER_ID, activeMonthKey);
      const nextPhotosByDate = toPhotosByDate(monthPhotos);

      setPhotosByDate((current) => ({
        ...current,
        ...nextPhotosByDate,
        [savedPhoto.date]: savedPhoto,
      }));

      if (previousPhoto?.storageKey && previousPhoto.storageKey !== savedPhoto.storageKey) {
        await deleteStoredPhotoFile(previousPhoto.storageKey, "Failed to delete replaced daily photo file");
      }

      syncRecapNotificationSchedule();

      return true;
    } catch (error) {
      if (nextStoredFile) {
        await deleteStoredPhotoFile(nextStoredFile.storageKey, "Failed to delete unsaved daily photo file");
      }

      logger.error("Failed to save today's photo", { dateKey, error });
      setPolicyDialog({
        type: "info",
        title: "저장 실패",
        message: dailyPhotoMessages.saveFailed,
      });
      return false;
    }
  };

  const dismissDialog = () => {
    setPolicyDialog({ type: "none" });
  };

  const dismissPhotoDetail = () => {
    setSelectedPhotoDateKey(null);
  };

  return {
    calendar,
    photoDetail,
    policyDialog,
    dismissDialog,
    dismissPhotoDetail,
    handleChangeSelectedPhoto,
    handleDeleteSelectedPhoto,
    handleSelectDate,
  };
}
