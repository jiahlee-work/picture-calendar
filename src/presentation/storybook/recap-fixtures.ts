import {
  RecapMonthStatus,
  type RecapMonthSummary,
} from "@/application/services/recap/recap-month-list";
import { createDailyPhotoFixtures } from "@/presentation/storybook/photo-fixtures";
import {
  MonthlyRecapSelectionStatus,
  MonthlyRecapTemplateId,
  type MonthlyRecap,
} from "@/shared/recap/types";

export const monthlyRecapPhotoFixtures = createDailyPhotoFixtures([
  "2026-07-01",
  "2026-07-02",
  "2026-07-04",
  "2026-07-05",
  "2026-07-08",
  "2026-07-10",
  "2026-07-13",
  "2026-07-16",
  "2026-07-22",
  "2026-07-28",
]);
const previewPhotos = monthlyRecapPhotoFixtures.slice(0, 4);
const selectedPhotoIds = monthlyRecapPhotoFixtures
  .slice(0, 8)
  .map((photo) => photo.id);

export const calendarCollageRecapFixture: MonthlyRecap = {
  backgroundPhotoIds: selectedPhotoIds.slice(0, 6),
  calendarPhotoIds: selectedPhotoIds.slice(0, 4),
  completedAt: "2026-08-01T09:08:00.000Z",
  createdAt: "2026-08-01T09:08:00.000Z",
  id: "storybook-calendar-collage-recap",
  month: "2026-07",
  promptedAt: "2026-08-01T09:00:00.000Z",
  selectedPhotoIds,
  selectionStatus: MonthlyRecapSelectionStatus.selected,
  templateId: MonthlyRecapTemplateId.calendarCollage,
  updatedAt: "2026-08-01T09:08:00.000Z",
  userId: "storybook-user",
};

export const messageRecapFixture: MonthlyRecap = {
  ...calendarCollageRecapFixture,
  backgroundPhotoIds: [],
  calendarPhotoIds: [],
  id: "storybook-message-recap",
  selectedPhotoIds: selectedPhotoIds.slice(0, 5),
  templateId: MonthlyRecapTemplateId.message,
};

export const recapMonthFixtures: RecapMonthSummary[] = [
  {
    month: "2026-07",
    monthLabel: "July",
    monthNumber: "07",
    photoCount: 18,
    previewPhotos,
    selectedPhotoIds: [],
    status: RecapMonthStatus.needsSelection,
    year: 2026,
  },
  {
    month: "2026-06",
    monthLabel: "June",
    monthNumber: "06",
    photoCount: 8,
    previewPhotos: previewPhotos.slice(0, 3),
    selectedPhotoIds: [],
    status: RecapMonthStatus.readyAuto,
    year: 2026,
  },
  {
    month: "2026-05",
    monthLabel: "May",
    monthNumber: "05",
    photoCount: 14,
    previewPhotos,
    selectedPhotoIds: ["photo-2026-07-02", "photo-2026-07-04"],
    status: RecapMonthStatus.selected,
    year: 2026,
  },
  {
    month: "2026-04",
    monthLabel: "April",
    monthNumber: "04",
    photoCount: 3,
    previewPhotos: previewPhotos.slice(0, 2),
    selectedPhotoIds: [],
    status: RecapMonthStatus.disabledCollecting,
    year: 2026,
  },
  {
    month: "2026-03",
    monthLabel: "March",
    monthNumber: "03",
    photoCount: 0,
    previewPhotos: [],
    selectedPhotoIds: [],
    status: RecapMonthStatus.disabledEmpty,
    year: 2026,
  },
];
