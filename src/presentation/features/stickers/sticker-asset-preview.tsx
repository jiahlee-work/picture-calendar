import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import type {
  BuiltInStickerAsset,
  StickerAsset,
} from "@/application/services/stickers/types";
import { PolaroidPhotoFrame } from "@/presentation/components/atoms/polaroid-photo-frame";
import { MonthlyRecapCalendarGrid } from "@/presentation/components/molecules/monthly-recap-calendar-grid";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

type StickerAssetPreviewProps = {
  asset: StickerAsset;
  size?: "detail" | "tile";
};

const BUILT_IN_CALENDAR_MONTH_DATE = dayjs("2026-07-01");
const BUILT_IN_CALENDAR = buildCalendarMonth(
  BUILT_IN_CALENDAR_MONTH_DATE.toDate(),
  dayjs("2026-07-24").toDate(),
);
const BUILT_IN_POLAROID_IMAGE = createBuiltInPolaroidImageUri();

export function StickerAssetPreview(props: StickerAssetPreviewProps) {
  const { asset, size = "tile" } = props;

  return (
    <View
      style={[
        styles.root,
        size === "detail" ? styles.detailRoot : styles.tileRoot,
      ]}
    >
      {asset.source === "user" ? (
        <Image
          cachePolicy="none"
          contentFit="contain"
          source={{ uri: asset.imagePath }}
          style={styles.userStickerImage}
        />
      ) : (
        <BuiltInStickerPreview asset={asset} size={size} />
      )}
    </View>
  );
}

function BuiltInStickerPreview(props: {
  asset: BuiltInStickerAsset;
  size: "detail" | "tile";
}) {
  const { asset, size } = props;

  if (asset.variant === "calendar") {
    return (
      <View
        style={[
          styles.builtInCalendarPreview,
          size === "detail" && styles.detailCalendarPreview,
        ]}
      >
        <View
          style={[
            styles.builtInCalendarScaleContent,
            size === "detail" && styles.detailCalendarScaleContent,
          ]}
        >
          <MonthlyRecapCalendarGrid
            cells={BUILT_IN_CALENDAR.days}
            monthDate={BUILT_IN_CALENDAR_MONTH_DATE}
          />
        </View>
      </View>
    );
  }

  return (
    <PolaroidPhotoFrame
      imagePath={BUILT_IN_POLAROID_IMAGE}
      orientation="landscape"
      style={[
        styles.builtInPolaroidPreview,
        size === "detail" && styles.detailPolaroidPreview,
      ]}
    />
  );
}

function createBuiltInPolaroidImageUri() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="360" height="260" viewBox="0 0 360 260">
      <defs>
        <linearGradient id="background" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#FF4F8B" />
          <stop offset="1" stop-color="#FFD166" />
        </linearGradient>
      </defs>
      <rect width="360" height="260" fill="url(#background)" />
      <circle cx="78" cy="70" r="52" fill="#253047" opacity="0.18" />
      <circle cx="304" cy="94" r="72" fill="#ffffff" opacity="0.25" />
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
  },
  tileRoot: {
    height: "100%",
    width: "100%",
  },
  detailRoot: {
    height: 260,
    width: "100%",
  },
  userStickerImage: {
    height: "100%",
    width: "100%",
  },
  builtInCalendarPreview: {
    alignItems: "center",
    backgroundColor: appColors.white,
    borderCurve: "continuous",
    borderRadius: 10,
    boxShadow: "0 10px 20px rgba(18, 18, 18, 0.08)",
    height: "86%",
    justifyContent: "center",
    overflow: "hidden",
    width: "86%",
  },
  detailCalendarPreview: {
    height: 240,
    width: 240,
  },
  builtInCalendarScaleContent: {
    height: 260,
    transform: [{ scale: 0.34 }],
    width: 260,
  },
  detailCalendarScaleContent: {
    transform: [{ scale: 0.82 }],
  },
  builtInPolaroidPreview: {
    height: "72%",
    position: "relative",
    width: "88%",
  },
  detailPolaroidPreview: {
    height: 190,
    width: 260,
  },
});
