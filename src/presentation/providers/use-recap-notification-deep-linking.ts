import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { createDailyPhotoRepositoryForRuntime } from "@/application/services/daily-photo/daily-photo-repository-factory";
import { LOCAL_USER_ID } from "@/application/services/local-user";
import { createLocalNotificationAdapterForRuntime } from "@/application/services/notifications/local-notification-adapter-factory";
import { handleMonthlyRecapNotificationResponse } from "@/application/services/notifications/recap-notification-service";
import { createMonthlyRecapRepositoryForRuntime } from "@/application/services/recap/monthly-recap-repository-factory";
import { createRecapNotificationSettingsRepositoryForRuntime } from "@/application/services/settings/recap-notification-settings-repository-factory";
import { runtimePlatform } from "@/infrastructure/device/runtime-platform";
import { logger } from "@/infrastructure/logging/logger";

export function useRecapNotificationDeepLinking() {
  const router = useRouter();
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
  const isHandlingResponseRef = useRef(false);

  const handleNotificationData = useCallback(
    async (data: Record<string, unknown>) => {
      if (isHandlingResponseRef.current) {
        return;
      }

      isHandlingResponseRef.current = true;

      try {
        const route = await handleMonthlyRecapNotificationResponse({
          dailyPhotoRepository,
          data,
          notificationAdapter,
          recapRepository,
          settingsRepository,
          userId: LOCAL_USER_ID,
        });

        if (route) {
          router.replace(route);
        }
      } catch (error) {
        logger.error("Failed to handle recap notification response", { error });
      } finally {
        isHandlingResponseRef.current = false;
      }
    },
    [
      dailyPhotoRepository,
      notificationAdapter,
      recapRepository,
      router,
      settingsRepository,
    ],
  );

  useEffect(() => {
    void notificationAdapter.configure().catch((error: unknown) => {
      logger.warn("Failed to configure recap notification handler", { error });
    });

    const lastResponseData = notificationAdapter.getLastResponseData();

    if (lastResponseData) {
      void handleNotificationData(lastResponseData);
    }

    const subscription = notificationAdapter.addResponseListener((data) => {
      void handleNotificationData(data);
    });

    return () => {
      subscription.remove();
    };
  }, [handleNotificationData, notificationAdapter]);
}
