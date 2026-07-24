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
import { createMonthlyRecapRepositoryForRuntime } from "@/application/services/recap/monthly-recap-repository-factory";
import { MonthlyRecapSelectionStatus, type MonthlyRecapRepository } from "@/application/services/recap/types";
import { createRecapNotificationSettingsRepositoryForRuntime } from "@/application/services/settings/recap-notification-settings-repository-factory";
import type { RecapNotificationSettingsRepository } from "@/application/services/settings/recap-notification-settings";
import { LocalNotificationPermissionStatus, type LocalNotificationAdapter } from "@/shared/notifications/types";

type BuildNextMonthlyRecapNotificationPlanOptions = {
  currentDate?: Date;
  dailyPhotoRepository: DailyPhotoRepository;
  recapRepository: MonthlyRecapRepository;
  userId: string;
};

type BuildMonthlyRecapNotificationPlanForMonthOptions = {
  dailyPhotoRepository: DailyPhotoRepository;
  month: string;
  recapRepository: MonthlyRecapRepository;
  triggerDate: Date;
  userId: string;
};

type SyncMonthlyRecapNotificationScheduleOptions = {
  currentDate?: Date;
  dailyPhotoRepository: DailyPhotoRepository;
  notificationAdapter: LocalNotificationAdapter;
  recapRepository: MonthlyRecapRepository;
  settingsRepository: RecapNotificationSettingsRepository;
  userId: string;
};

type ResolveMonthlyRecapNotificationRouteOptions = {
  dailyPhotoRepository: DailyPhotoRepository;
  data: Record<string, unknown>;
  recapRepository: MonthlyRecapRepository;
  userId: string;
};

export async function buildNextMonthlyRecapNotificationPlan({
  currentDate,
  dailyPhotoRepository,
  recapRepository,
  userId,
}: BuildNextMonthlyRecapNotificationPlanOptions): Promise<MonthlyRecapNotificationPlan | null> {
  const notificationWindow = getNextMonthlyRecapNotificationWindow(currentDate);

  return buildMonthlyRecapNotificationPlanForMonth({
    dailyPhotoRepository,
    month: notificationWindow.month,
    recapRepository,
    triggerDate: notificationWindow.triggerDate,
    userId,
  });
}

export async function syncMonthlyRecapNotificationSchedule({
  currentDate,
  dailyPhotoRepository,
  notificationAdapter,
  recapRepository,
  settingsRepository,
  userId,
}: SyncMonthlyRecapNotificationScheduleOptions): Promise<MonthlyRecapNotificationPlan | null> {
  const settings = await settingsRepository.load();
  const permissionStatus = await notificationAdapter.getPermissionStatus();

  if (
    !settings.isEnabled
    || !notificationAdapter.isSupported
    || permissionStatus !== LocalNotificationPermissionStatus.granted
  ) {
    await cancelMonthlyRecapNotifications(notificationAdapter);
    return null;
  }

  await notificationAdapter.configure();
  await cancelMonthlyRecapNotifications(notificationAdapter);

  const plan = await buildNextMonthlyRecapNotificationPlan({
    currentDate,
    dailyPhotoRepository,
    recapRepository,
    userId,
  });

  if (!plan) {
    return null;
  }

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
  platform?: string,
  currentDate?: Date,
): Promise<MonthlyRecapNotificationPlan | null> {
  return syncMonthlyRecapNotificationSchedule({
    currentDate,
    dailyPhotoRepository: createDailyPhotoRepositoryForRuntime(platform),
    notificationAdapter: createLocalNotificationAdapterForRuntime(platform),
    recapRepository: createMonthlyRecapRepositoryForRuntime(platform),
    settingsRepository: createRecapNotificationSettingsRepositoryForRuntime(platform),
    userId: LOCAL_USER_ID,
  });
}

async function buildMonthlyRecapNotificationPlanForMonth({
  dailyPhotoRepository,
  month,
  recapRepository,
  triggerDate,
  userId,
}: BuildMonthlyRecapNotificationPlanForMonthOptions): Promise<MonthlyRecapNotificationPlan | null> {
  const photos = sortRecapMonthPhotos(await dailyPhotoRepository.listByMonth(userId, month));
  const recap = await recapRepository.getByMonth(userId, month);

  return createMonthlyRecapNotificationPlan({
    hasSelectedRecap: hasSelectedRecapForCurrentPhotos(recap, photos.map((photo) => photo.id)),
    month,
    photoCount: photos.length,
    triggerDate,
  });
}

export async function resolveMonthlyRecapNotificationRoute({
  dailyPhotoRepository,
  data,
  recapRepository,
  userId,
}: ResolveMonthlyRecapNotificationRouteOptions): Promise<MonthlyRecapNotificationRoute | null> {
  const payload = parseMonthlyRecapNotificationPayload(data);

  if (!payload) {
    return null;
  }

  const photos = sortRecapMonthPhotos(await dailyPhotoRepository.listByMonth(userId, payload.month));
  const recap = await recapRepository.getByMonth(userId, payload.month);
  const plan = createMonthlyRecapNotificationPlan({
    hasSelectedRecap: hasSelectedRecapForCurrentPhotos(recap, photos.map((photo) => photo.id)),
    month: payload.month,
    photoCount: photos.length,
    triggerDate: new Date(),
  });

  if (!plan) {
    return {
      pathname: "/recap",
    };
  }

  return toMonthlyRecapNotificationRoute(plan);
}

export async function cancelMonthlyRecapNotifications(
  notificationAdapter: LocalNotificationAdapter,
): Promise<void> {
  await notificationAdapter.cancelScheduledNotifications({
    dataKind: MONTHLY_RECAP_NOTIFICATION_KIND,
    identifierPrefix: MONTHLY_RECAP_NOTIFICATION_IDENTIFIER_PREFIX,
  });
}

function hasSelectedRecapForCurrentPhotos(
  recap: Awaited<ReturnType<MonthlyRecapRepository["getByMonth"]>>,
  photoIds: string[],
): boolean {
  if (recap?.selectionStatus !== MonthlyRecapSelectionStatus.selected) {
    return false;
  }

  const currentPhotoIds = new Set(photoIds);

  return recap.selectedPhotoIds.some((photoId) => currentPhotoIds.has(photoId));
}
