import {
  RecapMonthStatus,
  type RecapMonthSummary,
} from "@/application/services/recap/recap-month-list";
import { createDailyPhotoFixtures } from "@/presentation/storybook/fixtures/photo-fixtures";

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
export const recapMonthFixtures: RecapMonthSummary[] = [
  {
    month: "2026-07",
    monthLabel: "July",
    monthNumber: "07",
    photoCount: 18,
    previewPhotos,
    status: RecapMonthStatus.ready,
    year: 2026,
  },
  {
    month: "2026-06",
    monthLabel: "June",
    monthNumber: "06",
    photoCount: 8,
    previewPhotos: previewPhotos.slice(0, 3),
    status: RecapMonthStatus.ready,
    year: 2026,
  },
  {
    month: "2026-05",
    monthLabel: "May",
    monthNumber: "05",
    photoCount: 14,
    previewPhotos,
    status: RecapMonthStatus.ready,
    year: 2026,
  },
  {
    month: "2026-04",
    monthLabel: "April",
    monthNumber: "04",
    photoCount: 3,
    previewPhotos: previewPhotos.slice(0, 2),
    status: RecapMonthStatus.disabledCollecting,
    year: 2026,
  },
  {
    month: "2026-03",
    monthLabel: "March",
    monthNumber: "03",
    photoCount: 0,
    previewPhotos: [],
    status: RecapMonthStatus.disabledEmpty,
    year: 2026,
  },
];
