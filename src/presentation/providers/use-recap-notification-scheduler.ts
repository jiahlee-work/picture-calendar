import { useEffect } from "react";

import { syncMonthlyRecapNotificationScheduleForRuntime } from "@/application/services/notifications/recap-notification-service";
import { subscribeToAppActive } from "@/infrastructure/device/app-lifecycle";
import { runtimePlatform } from "@/infrastructure/device/runtime-platform";
import { logger } from "@/infrastructure/logging/logger";

export function useRecapNotificationScheduler() {
  useEffect(() => {
    const syncSchedule = async () => {
      try {
        await syncMonthlyRecapNotificationScheduleForRuntime(runtimePlatform);
      } catch (error) {
        logger.warn("Failed to sync recap notification schedule", { error });
      }
    };

    void syncSchedule();

    const subscription = subscribeToAppActive(() => {
      void syncSchedule();
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
