import type { DailyPhotoRepository } from "@/application/services/daily-photo/types";
import { dayjs } from "@/shared/date/dayjs";

const sampleDayNumbers = [2, 4, 6, 8, 11, 13, 16, 18, 20, 23, 26, 29] as const;

const androidSamplePhotoFileNames = [
  "10.jpg",
  "44.jpg",
  "55.jpg",
  "66.jpg",
  "77.jpg",
  "88.jpg",
  "99.jpg",
  "1111.jpg",
  "1212.jpg",
  "1313.jpg",
  "1414.jpg",
  "1515.jpg",
] as const;

type SeedDevelopmentSampleDailyPhotosOptions = {
  monthKey: string;
  repository: DailyPhotoRepository;
  userId: string;
};

export const seedDevelopmentSampleDailyPhotos = async ({
  monthKey,
  repository,
  userId,
}: SeedDevelopmentSampleDailyPhotosOptions) => {
  const samples = toSamplePhotoDrafts(monthKey);

  for (const sample of samples) {
    await repository.saveToday({
      userId,
      date: sample.date,
      imagePath: sample.imagePath,
      localImagePath: sample.imagePath,
      remoteImageUrl: null,
      storageKey: sample.storageKey,
      syncStatus: "local",
    });
  }
};

const toSamplePhotoDrafts = (monthKey: string) =>
  sampleDayNumbers.flatMap((dayNumber, index) => {
    const date = dayjs(`${monthKey}-${dayNumber.toString().padStart(2, "0")}`);

    if (date.format("YYYY-MM") !== monthKey) {
      return [];
    }

    const fileName = androidSamplePhotoFileNames[index];
    const imagePath = `file:///data/user/0/com.jiahleework.pical/files/PicalSamples/${fileName}`;

    return [
      {
        date: date.format("YYYY-MM-DD"),
        imagePath,
        storageKey: `development/android-sample-${dayNumber}`,
      },
    ];
  });
