import {
  createBrowserRecapNotificationSettingsRepository,
  createFileRecapNotificationSettingsRepository,
} from "@/infrastructure/persistence/settings/local-recap-notification-settings-repository";
import type { RecapNotificationSettingsRepository } from "@/application/services/settings/recap-notification-settings";

export function createRecapNotificationSettingsRepositoryForRuntime(
  platform = process.env.EXPO_OS,
): RecapNotificationSettingsRepository {
  if (platform === "web") {
    return createBrowserRecapNotificationSettingsRepository();
  }

  return createFileRecapNotificationSettingsRepository();
}
