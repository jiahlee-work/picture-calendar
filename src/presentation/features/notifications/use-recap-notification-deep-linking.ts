import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Platform } from "react-native";

import { createDailyPhotoRepositoryForRuntime } from "@/application/services/daily-photo/daily-photo-repository-factory";
import { LOCAL_USER_ID } from "@/application/services/local-user";
import { createLocalNotificationAdapterForRuntime } from "@/application/services/notifications/local-notification-adapter-factory";
import {
  resolveMonthlyRecapNotificationRoute,
  syncMonthlyRecapNotificationScheduleForRuntime,
} from "@/application/services/notifications/recap-notification-service";
import { createMonthlyRecapRepositoryForRuntime } from "@/application/services/recap/monthly-recap-repository-factory";
import { logger } from "@/infrastructure/logging/logger";

export function useRecapNotificationDeepLinking() {
  const router = useRouter();
  const dailyPhotoRepository = useMemo(() => createDailyPhotoRepositoryForRuntime(Platform.OS), []);
  const notificationAdapter = useMemo(() => createLocalNotificationAdapterForRuntime(Platform.OS), []);
  const recapRepository = useMemo(() => createMonthlyRecapRepositoryForRuntime(Platform.OS), []);
  const isHandlingResponseRef = useRef(false);

  const handleNotificationData = useCallback(async (data: Record<string, unknown>) => {
    if (isHandlingResponseRef.current) {
      return;
    }

    isHandlingResponseRef.current = true;

    try {
      const route = await resolveMonthlyRecapNotificationRoute({
        dailyPhotoRepository,
        data,
        recapRepository,
        userId: LOCAL_USER_ID,
      });

      if (route) {
        router.replace(route);
      }

      notificationAdapter.clearLastResponse();
      await syncMonthlyRecapNotificationScheduleForRuntime(Platform.OS);
    } catch (error) {
      logger.error("Failed to handle recap notification response", { error });
    } finally {
      isHandlingResponseRef.current = false;
    }
  }, [dailyPhotoRepository, notificationAdapter, recapRepository, router]);

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
