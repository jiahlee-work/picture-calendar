import {
  LocalNotificationPermissionStatus,
  type LocalNotificationAdapter,
} from "@/shared/notifications/types";

export function createUnsupportedLocalNotificationAdapter(): LocalNotificationAdapter {
  return {
    isSupported: false,
    addResponseListener() {
      return {
        remove() {
          return undefined;
        },
      };
    },
    async cancelScheduledNotifications() {
      return undefined;
    },
    clearLastResponse() {
      return undefined;
    },
    async configure() {
      return undefined;
    },
    getLastResponseData() {
      return null;
    },
    async getPermissionStatus() {
      return LocalNotificationPermissionStatus.unsupported;
    },
    async requestPermission() {
      return LocalNotificationPermissionStatus.unsupported;
    },
    async scheduleNotification() {
      return null;
    },
  };
}
