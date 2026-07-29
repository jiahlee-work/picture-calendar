import { useCallback, useEffect, useMemo, useState } from "react";

import { createDailyPhotoRepositoryForRuntime } from "@/application/services/daily-photo/daily-photo-repository-factory";
import { LOCAL_USER_ID } from "@/application/services/local-user";
import { createLocalNotificationAdapterForRuntime } from "@/application/services/notifications/local-notification-adapter-factory";
import {
  cancelMonthlyRecapNotifications,
  syncMonthlyRecapNotificationSchedule,
} from "@/application/services/notifications/recap-notification-service";
import { createMonthlyRecapRepositoryForRuntime } from "@/application/services/recap/monthly-recap-repository-factory";
import { createRecapNotificationSettingsRepositoryForRuntime } from "@/application/services/settings/recap-notification-settings-repository-factory";
import { subscribeToAppActive } from "@/infrastructure/device/app-lifecycle";
import { runtimePlatform } from "@/infrastructure/device/runtime-platform";
import { logger } from "@/infrastructure/logging/logger";
import {
  LocalNotificationPermissionStatus,
  type LocalNotificationPermissionStatus as LocalNotificationPermissionStatusType,
} from "@/shared/notifications/types";

type UseRecapNotificationSettingsState = {
  errorMessage: string | null;
  isEnabled: boolean;
  isLoading: boolean;
  isSupported: boolean;
  permissionStatus: LocalNotificationPermissionStatusType;
};

const INITIAL_STATE: UseRecapNotificationSettingsState = {
  errorMessage: null,
  isEnabled: false,
  isLoading: true,
  isSupported: false,
  permissionStatus: LocalNotificationPermissionStatus.undetermined,
};

export function useRecapNotificationSettings() {
  const dailyPhotoRepository = useMemo(
    () => createDailyPhotoRepositoryForRuntime(runtimePlatform),
    [],
  );
  const notificationAdapter = useMemo(
    () => createLocalNotificationAdapterForRuntime(runtimePlatform),
    [],
  );
  const recapRepository = useMemo(
    () => createMonthlyRecapRepositoryForRuntime(runtimePlatform),
    [],
  );
  const settingsRepository = useMemo(
    () => createRecapNotificationSettingsRepositoryForRuntime(runtimePlatform),
    [],
  );
  const [state, setState] = useState<UseRecapNotificationSettingsState>({
    ...INITIAL_STATE,
    isSupported: notificationAdapter.isSupported,
  });

  const refresh = useCallback(async () => {
    try {
      const settings = await settingsRepository.load();
      const permissionStatus = await notificationAdapter.getPermissionStatus();

      if (settings.isEnabled) {
        await syncMonthlyRecapNotificationSchedule({
          dailyPhotoRepository,
          notificationAdapter,
          recapRepository,
          settingsRepository,
          userId: LOCAL_USER_ID,
        });
      }

      setState({
        errorMessage: null,
        isEnabled: settings.isEnabled,
        isLoading: false,
        isSupported: notificationAdapter.isSupported,
        permissionStatus,
      });
    } catch (error) {
      logger.error("Failed to refresh recap notification settings", { error });
      setState((current) => ({
        ...current,
        errorMessage: "리캡 알림 상태를 불러오지 못했습니다.",
        isLoading: false,
      }));
    }
  }, [
    dailyPhotoRepository,
    notificationAdapter,
    recapRepository,
    settingsRepository,
  ]);

  const setEnabled = useCallback(
    async (isEnabled: boolean) => {
      setState((current) => ({
        ...current,
        errorMessage: null,
        isLoading: true,
      }));

      try {
        if (!isEnabled || !notificationAdapter.isSupported) {
          await settingsRepository.save({ isEnabled: false });
          await cancelMonthlyRecapNotifications(notificationAdapter);

          setState({
            errorMessage: null,
            isEnabled: false,
            isLoading: false,
            isSupported: notificationAdapter.isSupported,
            permissionStatus: await notificationAdapter.getPermissionStatus(),
          });
          return;
        }

        let permissionStatus = await notificationAdapter.getPermissionStatus();

        if (
          permissionStatus === LocalNotificationPermissionStatus.undetermined
        ) {
          permissionStatus = await notificationAdapter.requestPermission();
        }

        if (permissionStatus !== LocalNotificationPermissionStatus.granted) {
          await settingsRepository.save({ isEnabled: false });
          await cancelMonthlyRecapNotifications(notificationAdapter);

          setState({
            errorMessage: null,
            isEnabled: false,
            isLoading: false,
            isSupported: notificationAdapter.isSupported,
            permissionStatus,
          });
          return;
        }

        await settingsRepository.save({ isEnabled: true });
        await syncMonthlyRecapNotificationSchedule({
          dailyPhotoRepository,
          notificationAdapter,
          recapRepository,
          settingsRepository,
          userId: LOCAL_USER_ID,
        });

        setState({
          errorMessage: null,
          isEnabled: true,
          isLoading: false,
          isSupported: notificationAdapter.isSupported,
          permissionStatus,
        });
      } catch (error) {
        logger.error("Failed to update recap notification settings", {
          error,
          isEnabled,
        });
        setState((current) => ({
          ...current,
          errorMessage: "리캡 알림 설정을 저장하지 못했습니다.",
          isLoading: false,
        }));
      }
    },
    [
      dailyPhotoRepository,
      notificationAdapter,
      recapRepository,
      settingsRepository,
    ],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void refresh();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [refresh]);

  useEffect(() => {
    const subscription = subscribeToAppActive(() => {
      void refresh();
    });

    return () => {
      subscription.remove();
    };
  }, [refresh]);

  return {
    ...state,
    refresh,
    setEnabled,
  };
}
