import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import {
  canEditDailyPhoto,
  dailyPhotoMessages,
  isDailyPhotoLocked,
} from "@/application/services/daily-photo/daily-photo-policy";
import { seedDevelopmentSampleDailyPhotos } from "@/application/services/daily-photo/development-sample-photos";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { pickImageFromLibrary } from "@/infrastructure/device/media/image-picker";
import { logger } from "@/infrastructure/logging/logger";
import { createLocalDailyPhotoFileStore } from "@/infrastructure/persistence/daily-photo/local-daily-photo-file-store";
import { createLocalDailyPhotoMetadataStore } from "@/infrastructure/persistence/daily-photo/local-daily-photo-metadata-store";
import { createLocalDailyPhotoRepository } from "@/infrastructure/persistence/daily-photo/local-daily-photo-repository";
import { toDateKey, toMonthKey } from "@/shared/date/date-key";
import { dayjs } from "@/shared/date/dayjs";

const localUserId = "local-user";

export type DialogState =
  | { type: "none" }
  | { type: "info"; title: string; message: string };

export function useTodayPhotoFlow(activeMonth: Date, today = dayjs().toDate()) {
  const [photosByDate, setPhotosByDate] = useState<Record<string, DailyPhoto>>({});
  const [dialog, setDialog] = useState<DialogState>({ type: "none" });
  const [hasShownFirstPhotoPolicy, setHasShownFirstPhotoPolicy] = useState(false);
  const fileStore = useMemo(() => createLocalDailyPhotoFileStore(), []);
  const repository = useMemo(
    () =>
      createLocalDailyPhotoRepository({
        metadataStore: createLocalDailyPhotoMetadataStore(),
      }),
    [],
  );
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const calendar = useMemo(() => buildCalendarMonth(activeMonth, today, photosByDate), [activeMonth, photosByDate, today]);
  const activeMonthKey = useMemo(() => toMonthKey(activeMonth), [activeMonth]);

  useEffect(() => {
    let isMounted = true;

    const loadMonthPhotos = async () => {
      let monthPhotos = await repository.listByMonth(localUserId, activeMonthKey);

      if (__DEV__ && Platform.OS === "android") {
        await seedDevelopmentSampleDailyPhotos({
          monthKey: activeMonthKey,
          repository,
          userId: localUserId,
        });
        monthPhotos = await repository.listByMonth(localUserId, activeMonthKey);
      }

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

    if (!canEditDailyPhoto(dateKey, todayKey)) {
      setDialog({
        type: "info",
        title: "사진 추가 불가",
        message: isDailyPhotoLocked(photo) ? dailyPhotoMessages.locked : dailyPhotoMessages.unavailable,
      });
      return;
    }

    if (isDailyPhotoLocked(photo)) {
      setDialog({
        type: "info",
        title: "잠김",
        message: dailyPhotoMessages.locked,
      });
      return;
    }

    const pickedImage = await pickImageFromLibrary();

    if (!pickedImage) {
      return;
    }

    await saveTodayPhoto({
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
      const hadAnyPhoto = await repository.hasAny(localUserId);
      const previousPhoto = photosByDate[dateKey] ?? null;
      nextStoredFile = await fileStore.save({
        userId: localUserId,
        date: dateKey,
        fileName,
        base64,
        mimeType,
        sourceUri,
      });
      const savedPhoto = await repository.saveToday({
        userId: localUserId,
        date: dateKey,
        ...nextStoredFile,
      });

      const monthPhotos = await repository.listByMonth(localUserId, activeMonthKey);
      const nextPhotosByDate = toPhotosByDate(monthPhotos);

      setPhotosByDate((current) => ({
        ...current,
        ...nextPhotosByDate,
        [savedPhoto.date]: savedPhoto,
      }));

      if (!hadAnyPhoto && !hasShownFirstPhotoPolicy) {
        setHasShownFirstPhotoPolicy(true);
        setDialog({
          type: "info",
          title: "오늘의 한 장이 저장됐어요",
          message: dailyPhotoMessages.firstSavePolicy,
        });
      }

      if (previousPhoto?.storageKey && previousPhoto.storageKey !== savedPhoto.storageKey) {
        await fileStore.delete(previousPhoto.storageKey);
      }
    } catch (error) {
      if (nextStoredFile) {
        await fileStore.delete(nextStoredFile.storageKey);
      }

      logger.error("Failed to save today's photo", { dateKey, error });
      setDialog({
        type: "info",
        title: "저장 실패",
        message: dailyPhotoMessages.saveFailed,
      });
    }
  };

  const dismissDialog = () => {
    setDialog({ type: "none" });
  };

  return {
    calendar,
    dialog,
    dismissDialog,
    handleSelectDate,
  };
}

function toPhotosByDate(photos: DailyPhoto[]): Record<string, DailyPhoto> {
  return Object.fromEntries(photos.map((photo) => [photo.date, photo]));
}
