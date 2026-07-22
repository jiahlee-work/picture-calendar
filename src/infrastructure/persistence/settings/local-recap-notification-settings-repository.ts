import { Directory, File, Paths } from "expo-file-system";

import {
  DEFAULT_RECAP_NOTIFICATION_SETTINGS,
  type RecapNotificationSettings,
  type RecapNotificationSettingsRepository,
  toRecapNotificationSettings,
} from "@/shared/settings/recap-notification-settings";

const SETTINGS_DIRECTORY_NAME = "settings";
const SETTINGS_FILE_NAME = "recap-notifications.json";
const BROWSER_STORAGE_KEY = "picture-calendar:recap-notifications";

export function createFileRecapNotificationSettingsRepository(): RecapNotificationSettingsRepository {
  const directory = new Directory(Paths.document, SETTINGS_DIRECTORY_NAME);
  const file = new File(directory, SETTINGS_FILE_NAME);

  return {
    async load() {
      if (!file.exists) {
        return DEFAULT_RECAP_NOTIFICATION_SETTINGS;
      }

      const contents = await file.text();

      if (!contents.trim()) {
        return DEFAULT_RECAP_NOTIFICATION_SETTINGS;
      }

      return toRecapNotificationSettings(JSON.parse(contents));
    },
    async save(settings) {
      directory.create({
        idempotent: true,
        intermediates: true,
      });

      if (!file.exists) {
        file.create({
          intermediates: true,
          overwrite: true,
        });
      }

      file.write(JSON.stringify(settings, null, 2));
    },
  };
}

export function createBrowserRecapNotificationSettingsRepository(): RecapNotificationSettingsRepository {
  return {
    async load() {
      const storage = getBrowserStorage();

      if (!storage) {
        return DEFAULT_RECAP_NOTIFICATION_SETTINGS;
      }

      const contents = storage.getItem(BROWSER_STORAGE_KEY);

      if (!contents) {
        return DEFAULT_RECAP_NOTIFICATION_SETTINGS;
      }

      return toRecapNotificationSettings(JSON.parse(contents));
    },
    async save(settings) {
      const storage = getBrowserStorage();

      if (!storage) {
        return;
      }

      storage.setItem(BROWSER_STORAGE_KEY, JSON.stringify(settings));
    },
  };
}

export function createMemoryRecapNotificationSettingsRepository(
  initialSettings: RecapNotificationSettings = DEFAULT_RECAP_NOTIFICATION_SETTINGS,
): RecapNotificationSettingsRepository {
  let settings = initialSettings;

  return {
    async load() {
      return settings;
    },
    async save(nextSettings) {
      settings = nextSettings;
    },
  };
}

function getBrowserStorage(): Storage | null {
  if (typeof globalThis.localStorage === "undefined") {
    return null;
  }

  return globalThis.localStorage;
}
