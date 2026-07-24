import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { logger } from "@/infrastructure/logging/logger";
import {
  LocalNotificationPermissionStatus,
  type LocalNotificationAdapter,
  type LocalNotificationMatcher,
  type LocalNotificationPermissionStatus as LocalNotificationPermissionStatusType,
} from "@/shared/notifications/types";

export const MONTHLY_RECAP_NOTIFICATION_CHANNEL_ID = "monthly-recap";

export function createExpoLocalNotificationAdapter(platform: string = Platform.OS): LocalNotificationAdapter {
  const isSupported = platform !== "web";

  return {
    isSupported,
    addResponseListener(listener) {
      if (!isSupported) {
        return {
          remove() {
            return undefined;
          },
        };
      }

      return Notifications.addNotificationResponseReceivedListener((response) => {
        listener(toNotificationData(response.notification.request.content.data));
      });
    },
    async cancelScheduledNotifications(matcher) {
      if (!isSupported) {
        return;
      }

      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const matchingNotifications = scheduledNotifications.filter((notification) =>
        matchesNotification(notification.identifier, notification.content.data, matcher),
      );

      await Promise.all(
        matchingNotifications.map((notification) =>
          Notifications.cancelScheduledNotificationAsync(notification.identifier),
        ),
      );
    },
    clearLastResponse() {
      if (!isSupported) {
        return;
      }

      try {
        Notifications.clearLastNotificationResponse();
      } catch (error) {
        logger.warn("Failed to clear last notification response", { error });
      }
    },
    async configure() {
      if (!isSupported) {
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      if (platform === "android") {
        await Notifications.setNotificationChannelAsync(MONTHLY_RECAP_NOTIFICATION_CHANNEL_ID, {
          importance: Notifications.AndroidImportance.DEFAULT,
          name: "월간 리캡",
          showBadge: false,
          sound: null,
        });
      }
    },
    getLastResponseData() {
      if (!isSupported) {
        return null;
      }

      let response: Notifications.NotificationResponse | null = null;

      try {
        response = Notifications.getLastNotificationResponse();
      } catch (error) {
        logger.warn("Failed to get last notification response", { error });
        return null;
      }

      return response ? toNotificationData(response.notification.request.content.data) : null;
    },
    async getPermissionStatus() {
      if (!isSupported) {
        return LocalNotificationPermissionStatus.unsupported;
      }

      return toLocalPermissionStatus(await Notifications.getPermissionsAsync());
    },
    async requestPermission() {
      if (!isSupported) {
        return LocalNotificationPermissionStatus.unsupported;
      }

      return toLocalPermissionStatus(await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: false,
          allowSound: true,
        },
      }));
    },
    async scheduleNotification(request) {
      if (!isSupported) {
        return null;
      }

      return Notifications.scheduleNotificationAsync({
        identifier: request.identifier,
        content: {
          body: request.body,
          data: request.data,
          sound: false,
          title: request.title,
        },
        trigger: {
          channelId: request.channelId ?? MONTHLY_RECAP_NOTIFICATION_CHANNEL_ID,
          date: request.triggerDate,
          type: Notifications.SchedulableTriggerInputTypes.DATE,
        },
      });
    },
  };
}

function toLocalPermissionStatus(
  permission: Notifications.NotificationPermissionsStatus,
): LocalNotificationPermissionStatusType {
  if (permission.granted || permission.status === "granted") {
    return LocalNotificationPermissionStatus.granted;
  }

  if (permission.status === "undetermined") {
    return LocalNotificationPermissionStatus.undetermined;
  }

  return LocalNotificationPermissionStatus.denied;
}

function matchesNotification(
  identifier: string,
  data: Record<string, unknown> | undefined,
  matcher: LocalNotificationMatcher,
): boolean {
  return (
    Boolean(matcher.identifierPrefix && identifier.startsWith(matcher.identifierPrefix))
    || Boolean(matcher.dataKind && data?.kind === matcher.dataKind)
  );
}

function toNotificationData(data: Record<string, unknown> | undefined): Record<string, unknown> {
  return data ?? {};
}
