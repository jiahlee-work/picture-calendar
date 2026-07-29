export type RecapNotificationSettings = {
  isEnabled: boolean;
};

export type RecapNotificationSettingsRepository = {
  load: () => Promise<RecapNotificationSettings>;
  save: (settings: RecapNotificationSettings) => Promise<void>;
};
