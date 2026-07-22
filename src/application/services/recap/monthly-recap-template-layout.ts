import { MonthlyRecapDetailStatus } from "@/application/services/recap/monthly-recap-detail";
import {
  MonthlyRecapTemplateId,
  type MonthlyRecap,
} from "@/shared/recap/types";

export type MonthlyRecapStatusLabelStatus = MonthlyRecapDetailStatus;

export type MonthlyRecapPhotoFrameLayout = {
  height: number;
  left: number;
  rotation: string;
  top: number;
  width: number;
  zIndex: number;
};

export type MonthlyRecapCardSize = {
  height: number;
  width: number;
};

export function getMonthlyRecapStatusLabel({
  photoCount,
  status,
  templateId,
}: {
  photoCount: number;
  status: MonthlyRecapStatusLabelStatus;
  templateId: MonthlyRecap["templateId"] | null;
}): string {
  if (status === MonthlyRecapDetailStatus.loading) {
    return "이 달의 리캡을 불러오는 중이에요.";
  }

  if (status === MonthlyRecapDetailStatus.error) {
    return "이 달의 리캡을 불러오지 못했습니다.";
  }

  if (status === MonthlyRecapDetailStatus.empty) {
    return "이 달에는 리캡에 사용할 사진이 없어요.";
  }

  if (status === MonthlyRecapDetailStatus.needsSelection) {
    return "대표 사진 선택 화면으로 이동 중이에요.";
  }

  if (status === MonthlyRecapDetailStatus.collecting) {
    return "이 달의 사진을 모으는 중이에요.";
  }

  return `${photoCount}장의 사진으로 ${templateId === MonthlyRecapTemplateId.message ? "메시지" : "캘린더"} 리캡을 준비했어요.`;
}

export function getMessageRecapPhotoFrameLayout(
  index: number,
  photoCount: number,
  width: number,
): MonthlyRecapPhotoFrameLayout {
  const frameLayouts = getMessageRecapPhotoFrameLayouts(photoCount, width);

  return frameLayouts[index] ?? frameLayouts[frameLayouts.length - 1];
}

export function getMessageRecapPhotoGroupSize(
  photoCount: number,
  width: number,
): MonthlyRecapCardSize {
  const frameLayouts = getMessageRecapPhotoFrameLayouts(photoCount, width);

  return {
    height: Math.max(
      0,
      ...frameLayouts.map(
        (frameLayout) => frameLayout.top + frameLayout.height,
      ),
    ),
    width,
  };
}

export function getCalendarRecapCardSize(width: number): MonthlyRecapCardSize {
  const cardWidth = width * 0.78;

  return {
    height: cardWidth * 1.35,
    width: cardWidth,
  };
}

export function getCalendarRecapPhotoSlotLayout(
  index: number,
  photoCount: number,
  width: number,
): MonthlyRecapPhotoFrameLayout {
  const cardSize = getCalendarRecapCardSize(width);
  const protectedTitleBottom = width * 0.18;
  const twoPhotoLayouts: MonthlyRecapPhotoFrameLayout[] = [
    {
      height: width * 0.25,
      left: -width * 0.07,
      rotation: "-7deg",
      top: protectedTitleBottom + width * 0.03,
      width: width * 0.33,
      zIndex: 6,
    },
    {
      height: width * 0.34,
      left: cardSize.width - width * 0.29,
      rotation: "6deg",
      top: protectedTitleBottom + width * 0.09,
      width: width * 0.24,
      zIndex: 7,
    },
  ];
  const layoutsByIndex: MonthlyRecapPhotoFrameLayout[] = [
    {
      height: width * 0.24,
      left: -width * 0.08,
      rotation: "-7deg",
      top: protectedTitleBottom + width * 0.02,
      width: width * 0.31,
      zIndex: 6,
    },
    {
      height: width * 0.34,
      left: cardSize.width - width * 0.28,
      rotation: "6deg",
      top: protectedTitleBottom + width * 0.08,
      width: width * 0.24,
      zIndex: 7,
    },
    {
      height: width * 0.34,
      left: width * 0.08,
      rotation: "4deg",
      top: cardSize.height - width * 0.08,
      width: width * 0.24,
      zIndex: 8,
    },
    {
      height: width * 0.23,
      left: cardSize.width - width * 0.39,
      rotation: "-5deg",
      top: cardSize.height - width * 0.04,
      width: width * 0.3,
      zIndex: 9,
    },
    {
      height: width * 0.21,
      left: cardSize.width * 0.35,
      rotation: "-2deg",
      top: cardSize.height - width * 0.15,
      width: width * 0.27,
      zIndex: 10,
    },
    {
      height: width * 0.29,
      left: -width * 0.04,
      rotation: "5deg",
      top: protectedTitleBottom + width * 0.28,
      width: width * 0.2,
      zIndex: 11,
    },
    {
      height: width * 0.21,
      left: cardSize.width - width * 0.25,
      rotation: "-4deg",
      top: protectedTitleBottom + width * 0.3,
      width: width * 0.27,
      zIndex: 12,
    },
    {
      height: width * 0.2,
      left: cardSize.width * 0.36,
      rotation: "3deg",
      top: protectedTitleBottom + width * 0.2,
      width: width * 0.25,
      zIndex: 13,
    },
  ];
  const resolvedLayouts = photoCount <= 2 ? twoPhotoLayouts : layoutsByIndex;

  return resolvedLayouts[index] ?? resolvedLayouts[resolvedLayouts.length - 1];
}

export function getMonthlyRecapSeasonEmojis(monthIndex: number): string {
  const emojis = [
    "❄️☕️🧣",
    "💌❄️🌙",
    "🌱🌷☀️",
    "🌷🌿☀️",
    "🌿🌼☀️",
    "☀️🌿🌊",
    "🍉☀️🌊",
    "🌊☀️🍧",
    "🍂🌾☕️",
    "🎃🍂🌙",
    "🧣🍁☕️",
    "✨❄️🎄",
  ];

  return emojis[monthIndex] ?? "✨🌙";
}

function getMessageRecapPhotoFrameLayouts(
  photoCount: number,
  width: number,
): MonthlyRecapPhotoFrameLayout[] {
  const onePhotoLayouts: MonthlyRecapPhotoFrameLayout[] = [
    {
      height: width * 0.92,
      left: width * 0.2,
      rotation: "0deg",
      top: 0,
      width: width * 0.74,
      zIndex: 2,
    },
  ];
  const twoPhotoLayouts: MonthlyRecapPhotoFrameLayout[] = [
    {
      height: width * 0.76,
      left: width * 0.22,
      rotation: "-4deg",
      top: 0,
      width: width * 0.52,
      zIndex: 2,
    },
    {
      height: width * 0.7,
      left: width * 0.43,
      rotation: "5deg",
      top: width * 0.46,
      width: width * 0.5,
      zIndex: 3,
    },
  ];
  const threePhotoLayouts: MonthlyRecapPhotoFrameLayout[] = [
    {
      height: width * 0.47,
      left: width * 0.48,
      rotation: "1deg",
      top: 0,
      width: width * 0.38,
      zIndex: 2,
    },
    {
      height: width * 0.47,
      left: width * 0.34,
      rotation: "-3deg",
      top: width * 0.39,
      width: width * 0.38,
      zIndex: 3,
    },
    {
      height: width * 0.46,
      left: width * 0.48,
      rotation: "2deg",
      top: width * 0.75,
      width: width * 0.38,
      zIndex: 4,
    },
  ];
  if (photoCount === 1) {
    return onePhotoLayouts;
  }

  if (photoCount === 2) {
    return twoPhotoLayouts;
  }

  return threePhotoLayouts.slice(0, photoCount);
}
