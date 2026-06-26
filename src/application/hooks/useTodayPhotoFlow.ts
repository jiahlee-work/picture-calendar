import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import { canEditDailyPhoto, dailyPhotoMessages } from "@/application/services/daily-photo/daily-photo-policy";
import { seedDevelopmentSampleDailyPhotos } from "@/application/services/daily-photo/development-sample-photos";
import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { pickImageFromLibrary } from "@/infrastructure/device/media/image-picker";
import { logger } from "@/infrastructure/logging/logger";
import { createLocalDailyPhotoFileStore } from "@/infrastructure/persistence/daily-photo/local-daily-photo-file-store";
import { createLocalDailyPhotoMetadataStore } from "@/infrastructure/persistence/daily-photo/local-daily-photo-metadata-store";
import { createLocalDailyPhotoRepository } from "@/infrastructure/persistence/daily-photo/local-daily-photo-repository";
import { toDateKey, toMonthKey } from "@/shared/date/date-key";
import { dayjs } from "@/shared/date/dayjs";
import type { DailyPhotoFileStore, DailyPhotoRepository } from "@/shared/daily-photo/types";

const localUserId = "local-user";

export type DailyPhotoPolicyDialogState =
  | { type: "none" }
  | { type: "info"; title: string; message: string };

export function useTodayPhotoFlow(activeMonth: Date, today = dayjs().toDate()) {
  const [photosByDate, setPhotosByDate] = useState<Record<string, DailyPhoto>>({});
  const [policyDialog, setPolicyDialog] = useState<DailyPhotoPolicyDialogState>({ type: "none" });
  const [selectedPhotoDateKey, setSelectedPhotoDateKey] = useState<string | null>(null);
  const fileStore = useMemo(createDailyPhotoFileStore, []);
  const repository = useMemo(createDailyPhotoRepository, []);
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

    if (isDisplayablePhoto(photo)) {
      setSelectedPhotoDateKey(dateKey);
      return;
    }

    setSelectedPhotoDateKey(null);

    if (!canEditDailyPhoto(dateKey, todayKey)) {
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
    if (isDevelopmentSampleStorageKey(storageKey)) {
      return;
    }

    try {
      await fileStore.delete(storageKey);
    } catch (error) {
      logger.warn(message, { storageKey, error });
    }
  };

  const handleDeleteSelectedPhoto = async () => {
    const dateKey = selectedPhotoDateKey;

    if (!dateKey) {
      return;
    }

    setSelectedPhotoDateKey(null);
    await waitForNextFrame();

    const deletedPhoto = await repository.deleteByDate(localUserId, dateKey);

    setPhotosByDate((current) => {
      const next = { ...current };

      delete next[dateKey];

      return next;
    });

    if (deletedPhoto?.storageKey) {
      await deleteStoredPhotoFile(deletedPhoto.storageKey, "Failed to delete daily photo file");
    }
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

      if (previousPhoto?.storageKey && previousPhoto.storageKey !== savedPhoto.storageKey) {
        await deleteStoredPhotoFile(previousPhoto.storageKey, "Failed to delete replaced daily photo file");
      }

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

function toPhotosByDate(photos: DailyPhoto[]): Record<string, DailyPhoto> {
  return Object.fromEntries(photos.map((photo) => [photo.date, photo]));
}

function isDisplayablePhoto(photo: DailyPhoto | null) {
  return Boolean(photo?.imagePath);
}

function isDevelopmentSampleStorageKey(storageKey: string) {
  return storageKey.startsWith("development/");
}

function waitForNextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
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

function createDailyPhotoFileStore(): DailyPhotoFileStore {
  if (Platform.OS === "web") {
    return createWebDailyPhotoFileStore();
  }

  return createLocalDailyPhotoFileStore();
}

function createWebDailyPhotoFileStore(): DailyPhotoFileStore {
  return {
    async save({ date, sourceUri, userId }) {
      return {
        imagePath: sourceUri,
        localImagePath: sourceUri,
        remoteImageUrl: null,
        storageKey: `web/${userId}/${date}/${dayjs().valueOf().toString(36)}`,
        syncStatus: "local",
      };
    },
    async delete() {
      return;
    },
  };
}
