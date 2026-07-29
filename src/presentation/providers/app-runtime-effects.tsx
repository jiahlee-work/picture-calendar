import { useEffect } from "react";

import { configureAndroidSystemBars } from "@/infrastructure/device/configure-system-bars";
import { runtimePlatform } from "@/infrastructure/device/runtime-platform";
import { useRecapNotificationDeepLinking } from "@/presentation/providers/use-recap-notification-deep-linking";
import { useRecapNotificationScheduler } from "@/presentation/providers/use-recap-notification-scheduler";
import { appColors } from "@/presentation/theme/colors";

export function AppRuntimeEffects() {
  useRecapNotificationScheduler();
  useRecapNotificationDeepLinking();

  useEffect(() => {
    if (runtimePlatform !== "android") {
      return;
    }

    configureAndroidSystemBars(appColors.background);
  }, []);

  return null;
}
