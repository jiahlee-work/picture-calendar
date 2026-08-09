import { createDailyPhotoRepositoryForRuntime } from "@/application/services/daily-photo/daily-photo-repository-factory";
import type { DailyPhotoRepository } from "@/application/services/daily-photo/types";
import { LOCAL_USER_ID } from "@/application/services/local-user";
import { MONTHLY_RECAP_NOTIFICATION_CHANNEL_ID } from "@/infrastructure/device/notifications/expo-local-notification-adapter";
import {
  createMonthlyRecapNotificationPlan,
  getNextMonthlyRecapNotificationWindow,
  MONTHLY_RECAP_NOTIFICATION_IDENTIFIER_PREFIX,
  MONTHLY_RECAP_NOTIFICATION_KIND,
  parseMonthlyRecapNotificationPayload,
  toMonthlyRecapNotificationRoute,
  type MonthlyRecapNotificationPlan,
  type MonthlyRecapNotificationRoute,
} from "@/application/services/notifications/recap-notification-policy";
import { createLocalNotificationAdapterForRuntime } from "@/application/services/notifications/local-notification-adapter-factory";
import { sortRecapMonthPhotos } from "@/application/services/recap/monthly-recap-photos";
import { createRecapNotificationSettingsRepositoryForRuntime } from "@/application/services/settings/recap-notification-settings-repository-factory";
import type { RecapNotificationSettingsRepository } from "@/application/services/settings/recap-notification-settings";
import {
  LocalNotificationPermissionStatus,
  type LocalNotificationAdapter,
} from "@/shared/notifications/types";

type BuildNextMonthlyRecapNotificationPlanOptions = {
  currentDate?: Date;
  dailyPhotoRepository: DailyPhotoRepository;
  userId: string;
};

type BuildMonthlyRecapNotificationPlanForMonthOptions = {
  dailyPhotoRepository: DailyPhotoRepository;
  month: string;
  triggerDate: Date;
  userId: string;
};

type SyncMonthlyRecapNotificationScheduleOptions = {
  currentDate?: Date;
  dailyPhotoRepository: DailyPhotoRepository;
  notificationAdapter: LocalNotificationAdapter;
  settingsRepository: RecapNotificationSettingsRepository;
  userId: string;
};

type ResolveMonthlyRecapNotificationRouteOptions = {
  dailyPhotoRepository: DailyPhotoRepository;
  data: Record<string, unknown>;
  userId: string;
};

type HandleMonthlyRecapNotificationResponseOptions =
  ResolveMonthlyRecapNotificationRouteOptions & {
    notificationAdapter: LocalNotificationAdapter;
    settingsRepository: RecapNotificationSettingsRepository;
  };

export async function buildNextMonthlyRecapNotificationPlan({
  currentDate,
  dailyPhotoRepository,
  userId,
}: BuildNextMonthlyRecapNotificationPlanOptions): Promise<MonthlyRecapNotificationPlan | null> {
  const notificationWindow = getNextMonthlyRecapNotificationWindow(currentDate);

  return buildMonthlyRecapNotificationPlanForMonth({
    dailyPhotoRepository,
    month: notificationWindow.month,
    triggerDate: notificationWindow.triggerDate,
    userId,
  });
}

export async function syncMonthlyRecapNotificationSchedule({
  currentDate,
  dailyPhotoRepository,
  notificationAdapter,
  settingsRepository,
  userId,
}: SyncMonthlyRecapNotificationScheduleOptions): Promise<MonthlyRecapNotificationPlan | null> {
  const settings = await settingsRepository.load();
  const permissionStatus = await notificationAdapter.getPermissionStatus();

  if (
    !settings.isEnabled ||
    !notificationAdapter.isSupported ||
    permissionStatus !== LocalNotificationPermissionStatus.granted
  ) {
    await cancelMonthlyRecapNotifications(notificationAdapter);
    return null;
  }

  await notificationAdapter.configure();
  await cancelMonthlyRecapNotifications(notificationAdapter);
  const plan = await buildNextMonthlyRecapNotificationPlan({
    currentDate,
    dailyPhotoRepository,
    userId,
  });

  if (!plan) return null;

  await notificationAdapter.scheduleNotification({
    body: plan.body,
    channelId: MONTHLY_RECAP_NOTIFICATION_CHANNEL_ID,
    data: plan.data,
    identifier: plan.identifier,
    title: plan.title,
    triggerDate: plan.triggerDate,
  });

  return plan;
}

export async function syncMonthlyRecapNotificationScheduleForRuntime(
  platform: string,
  currentDate?: Date,
): Promise<MonthlyRecapNotificationPlan | null> {
  return syncMonthlyRecapNotificationSchedule({
    currentDate,
    dailyPhotoRepository: createDailyPhotoRepositoryForRuntime(platform),
    notificationAdapter: createLocalNotificationAdapterForRuntime(platform),
    settingsRepository:
      createRecapNotificationSettingsRepositoryForRuntime(platform),
    userId: LOCAL_USER_ID,
  });
}

export async function handleMonthlyRecapNotificationResponse({
  dailyPhotoRepository,
  data,
  notificationAdapter,
  settingsRepository,
  userId,
}: HandleMonthlyRecapNotificationResponseOptions): Promise<MonthlyRecapNotificationRoute | null> {
  const route = await resolveMonthlyRecapNotificationRoute({
    dailyPhotoRepository,
    data,
    userId,
  });

  notificationAdapter.clearLastResponse();
  await syncMonthlyRecapNotificationSchedule({
    dailyPhotoRepository,
    notificationAdapter,
    settingsRepository,
    userId,
  });

  return route;
}

async function buildMonthlyRecapNotificationPlanForMonth({
  dailyPhotoRepository,
  month,
  triggerDate,
  userId,
}: BuildMonthlyRecapNotificationPlanForMonthOptions) {
  const photos = sortRecapMonthPhotos(
    await dailyPhotoRepository.listByMonth(userId, month),
  );

  return createMonthlyRecapNotificationPlan({
    month,
    photoCount: photos.length,
    triggerDate,
  });
}

export async function resolveMonthlyRecapNotificationRoute({
  dailyPhotoRepository,
  data,
  userId,
}: ResolveMonthlyRecapNotificationRouteOptions): Promise<MonthlyRecapNotificationRoute | null> {
  const payload = parseMonthlyRecapNotificationPayload(data);
  if (!payload) return null;

  const photos = sortRecapMonthPhotos(
    await dailyPhotoRepository.listByMonth(userId, payload.month),
  );
  const plan = createMonthlyRecapNotificationPlan({
    month: payload.month,
    photoCount: photos.length,
    triggerDate: new Date(),
  });

  return plan ? toMonthlyRecapNotificationRoute(plan) : { pathname: "/recap" };
}

export async function cancelMonthlyRecapNotifications(
  notificationAdapter: LocalNotificationAdapter,
): Promise<void> {
  await notificationAdapter.cancelScheduledNotifications({
    dataKind: MONTHLY_RECAP_NOTIFICATION_KIND,
    identifierPrefix: MONTHLY_RECAP_NOTIFICATION_IDENTIFIER_PREFIX,
  });
}
