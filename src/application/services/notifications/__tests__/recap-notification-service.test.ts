import { describe, expect, it, vi } from "vitest";

import {
  handleMonthlyRecapNotificationResponse,
  syncMonthlyRecapNotificationSchedule,
} from "@/application/services/notifications/recap-notification-service";
import {
  MonthlyRecapSelectionStatus,
  MonthlyRecapTemplateId,
} from "@/application/services/recap/types";
import { dayjs } from "@/shared/date/dayjs";
import type {
  DailyPhoto,
  DailyPhotoRepository,
} from "@/shared/daily-photo/types";
import {
  LocalNotificationPermissionStatus,
  type LocalNotificationAdapter,
  type LocalNotificationRequest,
} from "@/shared/notifications/types";
import type {
  MonthlyRecap,
  MonthlyRecapRepository,
} from "@/shared/recap/types";
import type { RecapNotificationSettingsRepository } from "@/shared/settings/recap-notification-settings";

vi.mock(
  "@/application/services/daily-photo/daily-photo-repository-factory",
  () => ({
    createDailyPhotoRepositoryForRuntime: vi.fn(),
  }),
);
vi.mock(
  "@/application/services/notifications/local-notification-adapter-factory",
  () => ({
    createLocalNotificationAdapterForRuntime: vi.fn(),
  }),
);
vi.mock(
  "@/application/services/recap/monthly-recap-repository-factory",
  () => ({
    createMonthlyRecapRepositoryForRuntime: vi.fn(),
  }),
);
vi.mock(
  "@/application/services/settings/recap-notification-settings-repository-factory",
  () => ({
    createRecapNotificationSettingsRepositoryForRuntime: vi.fn(),
  }),
);
vi.mock(
  "@/infrastructure/device/notifications/expo-local-notification-adapter",
  () => ({
    MONTHLY_RECAP_NOTIFICATION_CHANNEL_ID: "monthly-recap",
  }),
);

describe("monthly recap notification service", () => {
  it("handles notification data and synchronizes external notification state", async () => {
    const notificationAdapter = createNotificationAdapter();

    const route = await handleMonthlyRecapNotificationResponse({
      dailyPhotoRepository: createDailyPhotoRepository({
        "2026-06": createPhotos("2026-06", 10),
      }),
      data: {
        destination: "select",
        kind: "monthly-recap",
        month: "2026-06",
        photoCount: 10,
      },
      notificationAdapter,
      recapRepository: createMonthlyRecapRepository(),
      settingsRepository: createSettingsRepository(false),
      userId: "local-user",
    });

    expect(route).toEqual({
      params: {
        month: "2026-06",
      },
      pathname: "/recap/select",
    });
    expect(notificationAdapter.clearLastResponse).toHaveBeenCalledOnce();
    expect(
      notificationAdapter.cancelScheduledNotifications,
    ).toHaveBeenCalledOnce();
  });

  it("syncs only the next monthly notification window and does not reuse the previous-month preview plan", async () => {
    const notificationAdapter = createNotificationAdapter();
    const scheduledRequests: LocalNotificationRequest[] = [];
    const currentDate = dayjs("2026-07-05T12:00:00").toDate();

    const plan = await syncMonthlyRecapNotificationSchedule({
      currentDate,
      dailyPhotoRepository: createDailyPhotoRepository({
        "2026-06": createPhotos("2026-06", 10),
        "2026-07": createPhotos("2026-07", 1),
      }),
      notificationAdapter: {
        ...notificationAdapter,
        scheduleNotification: async (request) => {
          scheduledRequests.push(request);
          return request.identifier;
        },
      },
      recapRepository: createMonthlyRecapRepository({
        "2026-06": createRecap({
          month: "2026-06",
          photoIds: createPhotoIds(10),
          selectionStatus: MonthlyRecapSelectionStatus.selected,
        }),
      }),
      settingsRepository: createSettingsRepository(true),
      userId: "local-user",
    });

    expect(plan).toMatchObject({
      body: "7월 리캡이 준비됐어요.",
      month: "2026-07",
    });
    expect(plan?.triggerDate).toEqual(dayjs("2026-08-01T09:00:00").toDate());
    expect(scheduledRequests).toHaveLength(1);
    expect(scheduledRequests[0]?.data).toMatchObject({
      month: "2026-07",
    });
    expect(scheduledRequests[0]?.triggerDate).toEqual(
      dayjs("2026-08-01T09:00:00").toDate(),
    );
  });
});

function createNotificationAdapter(): LocalNotificationAdapter {
  return {
    isSupported: true,
    addResponseListener: () => ({
      remove() {
        return undefined;
      },
    }),
    cancelScheduledNotifications: vi.fn(async () => undefined),
    clearLastResponse: vi.fn(),
    configure: vi.fn(async () => undefined),
    getLastResponseData: () => null,
    getPermissionStatus: vi.fn(
      async () => LocalNotificationPermissionStatus.granted,
    ),
    requestPermission: vi.fn(
      async () => LocalNotificationPermissionStatus.granted,
    ),
    scheduleNotification: vi.fn(async (request) => request.identifier),
  };
}

function createSettingsRepository(
  isEnabled: boolean,
): RecapNotificationSettingsRepository {
  return {
    load: vi.fn(async () => ({ isEnabled })),
    save: vi.fn(async () => undefined),
  };
}

function createDailyPhotoRepository(
  photosByMonth: Record<string, DailyPhoto[]>,
): DailyPhotoRepository {
  return {
    deleteByDate: vi.fn(async () => null),
    hasAny: vi.fn(async () =>
      Object.values(photosByMonth).some((photos) => photos.length > 0),
    ),
    listByMonth: vi.fn(async (_userId, month) => photosByMonth[month] ?? []),
    saveToday: vi.fn(async (photo) => createPhoto(photo.date.slice(0, 7), 1)),
  };
}

function createMonthlyRecapRepository(
  recapsByMonth: Record<string, MonthlyRecap | null> = {},
): MonthlyRecapRepository {
  return {
    getByMonth: vi.fn(async (_userId, month) => recapsByMonth[month] ?? null),
    listByYear: vi.fn(async () =>
      Object.values(recapsByMonth).filter(
        (recap): recap is MonthlyRecap => recap !== null,
      ),
    ),
    markPrompted: vi.fn(async (_userId, month) =>
      createRecap({ month, photoIds: [] }),
    ),
    saveSelection: vi.fn(async (selection) =>
      createRecap({
        month: selection.month,
        photoIds: selection.selectedPhotoIds,
        selectionStatus: MonthlyRecapSelectionStatus.selected,
      }),
    ),
    skipSelection: vi.fn(async (_userId, month) =>
      createRecap({
        month,
        photoIds: [],
        selectionStatus: MonthlyRecapSelectionStatus.skipped,
      }),
    ),
  };
}

function createPhotos(month: string, count: number): DailyPhoto[] {
  return Array.from({ length: count }, (_, index) =>
    createPhoto(month, index + 1),
  );
}

function createPhoto(month: string, day: number): DailyPhoto {
  const date = `${month}-${String(day).padStart(2, "0")}`;

  return {
    id: `photo-${day}`,
    userId: "local-user",
    date,
    imagePath: `file://${date}.jpg`,
    localImagePath: `file://${date}.jpg`,
    remoteImageUrl: null,
    storageKey: null,
    syncStatus: "local",
    createdAt: `${date}T00:00:00.000Z`,
    updatedAt: `${date}T00:00:00.000Z`,
    lockedAt: null,
  };
}

function createPhotoIds(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `photo-${index + 1}`);
}

function createRecap({
  month,
  photoIds,
  selectionStatus = MonthlyRecapSelectionStatus.notStarted,
}: {
  month: string;
  photoIds: string[];
  selectionStatus?: MonthlyRecap["selectionStatus"];
}): MonthlyRecap {
  return {
    id: `recap-${month}`,
    userId: "local-user",
    month,
    selectedPhotoIds: photoIds,
    templateId: MonthlyRecapTemplateId.calendarCollage,
    calendarPhotoIds: photoIds,
    backgroundPhotoIds: photoIds,
    selectionStatus,
    promptedAt: null,
    completedAt:
      selectionStatus === MonthlyRecapSelectionStatus.selected
        ? `${month}-30T00:00:00.000Z`
        : null,
    createdAt: `${month}-01T00:00:00.000Z`,
    updatedAt: `${month}-01T00:00:00.000Z`,
  };
}
