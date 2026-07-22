export const LocalNotificationPermissionStatus = {
  denied: "denied",
  granted: "granted",
  undetermined: "undetermined",
  unsupported: "unsupported",
} as const;

export type LocalNotificationPermissionStatus =
  (typeof LocalNotificationPermissionStatus)[keyof typeof LocalNotificationPermissionStatus];

export type LocalNotificationRequest = {
  body: string;
  channelId?: string;
  data: Record<string, unknown>;
  identifier: string;
  title: string;
  triggerDate: Date;
};

export type LocalNotificationMatcher = {
  dataKind?: string;
  identifierPrefix?: string;
};

export type LocalNotificationSubscription = {
  remove: () => void;
};

export type LocalNotificationAdapter = {
  isSupported: boolean;
  addResponseListener: (
    listener: (data: Record<string, unknown>) => void,
  ) => LocalNotificationSubscription;
  cancelScheduledNotifications: (matcher: LocalNotificationMatcher) => Promise<void>;
  clearLastResponse: () => void;
  configure: () => Promise<void>;
  getLastResponseData: () => Record<string, unknown> | null;
  getPermissionStatus: () => Promise<LocalNotificationPermissionStatus>;
  requestPermission: () => Promise<LocalNotificationPermissionStatus>;
  scheduleNotification: (request: LocalNotificationRequest) => Promise<string | null>;
};
