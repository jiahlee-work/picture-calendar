export type RecapNotificationSettings = {
  isEnabled: boolean;
};

export type RecapNotificationSettingsRepository = {
  load: () => Promise<RecapNotificationSettings>;
  save: (settings: RecapNotificationSettings) => Promise<void>;
};

export const DEFAULT_RECAP_NOTIFICATION_SETTINGS: RecapNotificationSettings = {
  isEnabled: false,
};

export function toRecapNotificationSettings(value: unknown): RecapNotificationSettings {
  if (!isObjectRecord(value)) {
    return DEFAULT_RECAP_NOTIFICATION_SETTINGS;
  }

  return {
    isEnabled: value.isEnabled === true,
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
