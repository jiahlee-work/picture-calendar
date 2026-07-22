import type { DailyPhoto } from "@/shared/daily-photo/types";

const fixturePalettes = [
  ["#FF4F8B", "#FFD166", "#253047"],
  ["#35C2FF", "#8AE6CF", "#1E2A44"],
  ["#A26DFF", "#F3C7FF", "#2A2142"],
  ["#FF8A3D", "#FFE8A3", "#352016"],
] as const;

export function createDailyPhotoFixture(
  id: string,
  date: string,
  assetIndex = 0,
): DailyPhoto {
  const imagePath = createFixtureImageUri(assetIndex);

  return {
    createdAt: `${date}T09:00:00.000Z`,
    date,
    id,
    imagePath,
    localImagePath: imagePath,
    lockedAt: null,
    remoteImageUrl: null,
    storageKey: `storybook/${id}`,
    syncStatus: "local",
    updatedAt: `${date}T09:00:00.000Z`,
    userId: "storybook-user",
  };
}

export function createDailyPhotoFixtures(dates: string[]) {
  return dates.map((date, index) =>
    createDailyPhotoFixture(`photo-${date}`, date, index),
  );
}

function createFixtureImageUri(assetIndex: number) {
  const palette = fixturePalettes[assetIndex % fixturePalettes.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="360" height="520" viewBox="0 0 360 520">
      <defs>
        <linearGradient id="background" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${palette[0]}" />
          <stop offset="1" stop-color="${palette[1]}" />
        </linearGradient>
      </defs>
      <rect width="360" height="520" fill="url(#background)" />
      <circle cx="78" cy="98" r="54" fill="${palette[2]}" opacity="0.24" />
      <circle cx="292" cy="178" r="78" fill="#ffffff" opacity="0.22" />
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
