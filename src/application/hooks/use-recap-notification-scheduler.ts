import { useEffect } from "react";
import { AppState, Platform } from "react-native";

import { syncMonthlyRecapNotificationScheduleForRuntime } from "@/application/services/notifications/recap-notification-service";
import { logger } from "@/infrastructure/logging/logger";

export function useRecapNotificationScheduler() {
  useEffect(() => {
    const syncSchedule = async () => {
      try {
        await syncMonthlyRecapNotificationScheduleForRuntime(Platform.OS);
      } catch (error) {
        logger.warn("Failed to sync recap notification schedule", { error });
      }
    };

    void syncSchedule();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        void syncSchedule();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
