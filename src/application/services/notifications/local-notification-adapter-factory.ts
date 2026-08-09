import { createExpoLocalNotificationAdapter } from "@/infrastructure/device/notifications/expo-local-notification-adapter";
import { createUnsupportedLocalNotificationAdapter } from "@/infrastructure/device/notifications/unsupported-local-notification-adapter";
import type { LocalNotificationAdapter } from "@/shared/notifications/types";

export function createLocalNotificationAdapterForRuntime(
  platform: string,
): LocalNotificationAdapter {
  if (platform === "web") {
    return createUnsupportedLocalNotificationAdapter();
  }

  return createExpoLocalNotificationAdapter(platform);
}
