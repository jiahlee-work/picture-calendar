import { Image as ExpoImage } from "expo-image";
import type { ReactNode } from "react";
import {
  Image as NativeImage,
  Platform,
  Pressable,
  StyleSheet,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Svg, { G, Path, Rect } from "react-native-svg";

import {
  RecapMonthStatus,
  type RecapMonthSummary,
} from "@/application/services/recap/recap-month-list";
import { appColors } from "@/presentation/theme/colors";
import type { DailyPhoto } from "@/shared/daily-photo/types";

const FOLDER_VIEWBOX_X = 40;
const FOLDER_VIEWBOX_Y = 20;
const FOLDER_VIEWBOX_WIDTH = 176;
const FOLDER_VIEWBOX_HEIGHT = 150;
const FOLDER_RENDER_WIDTH = 172;
const FOLDER_RENDER_HEIGHT =
  (FOLDER_RENDER_WIDTH / FOLDER_VIEWBOX_WIDTH) * FOLDER_VIEWBOX_HEIGHT;
const FOLDER_VISIBLE_BOTTOM_Y = 150;
const FOLDER_LAYOUT_HEIGHT =
  (FOLDER_RENDER_WIDTH / FOLDER_VIEWBOX_WIDTH) *
  (FOLDER_VISIBLE_BOTTOM_Y - FOLDER_VIEWBOX_Y);
const FOLDER_BODY_VIEWBOX_WIDTH = 152;
const FOLDER_LABEL_WIDTH =
  (FOLDER_RENDER_WIDTH / FOLDER_VIEWBOX_WIDTH) * FOLDER_BODY_VIEWBOX_WIDTH;
const MAX_FOLDER_PREVIEW_PHOTOS = 3;
const PHOTO_CARD_FRAME_WIDTH = 140;
const PHOTO_CARD_FRAME_HEIGHT = 180;
const PHOTO_CARD_IMAGE_WIDTH = 124;
const PHOTO_CARD_IMAGE_HEIGHT = 164;
const FOLDER_FRONT_TOP = 58;
const FOLDER_FRONT_BLUR_RADIUS = Platform.OS === "android" ? 16 : 30;
const FRONT_FILL_PATH =
  "M40.0952 87.0552C39.4381 83.3775 42.2657 80 46.0016 80H209.583C213.347 80 216.182 83.4257 215.477 87.1232L204.424 145.123C203.885 147.953 201.411 150 198.531 150H56.3636C53.457 150 50.9684 147.917 50.4572 145.055L40.0952 87.0552Z";
const FRONT_STROKE_PATH =
  "M46.0017 80.5H209.584C213.034 80.5002 215.632 83.6401 214.986 87.0293L203.933 145.029C203.439 147.623 201.171 149.5 198.531 149.5H56.364C53.6997 149.5 51.4177 147.59 50.949 144.968L40.5876 86.9668C39.9856 83.5957 42.5772 80.5 46.0017 80.5Z";

type PreviewSlot = {
  centerX: number;
  centerY: number;
  rotate: string;
  scaleX: number;
  scaleY: number;
  zIndex: number;
};

const PREVIEW_SLOTS_BY_COUNT = {
  1: [
    {
      centerX: 86,
      centerY: 76,
      rotate: "-7deg",
      scaleX: 0.46,
      scaleY: 0.5,
      zIndex: 1,
    },
  ],
  2: [
    {
      centerX: 70,
      centerY: 77,
      rotate: "-9deg",
      scaleX: 0.42,
      scaleY: 0.46,
      zIndex: 1,
    },
    {
      centerX: 110,
      centerY: 76,
      rotate: "12deg",
      scaleX: 0.41,
      scaleY: 0.45,
      zIndex: 2,
    },
  ],
  3: [
    {
      centerX: 56,
      centerY: 80,
      rotate: "-18deg",
      scaleX: 0.37,
      scaleY: 0.41,
      zIndex: 1,
    },
    {
      centerX: 86,
      centerY: 74,
      rotate: "0deg",
      scaleX: 0.42,
      scaleY: 0.46,
      zIndex: 3,
    },
    {
      centerX: 116,
      centerY: 79,
      rotate: "18deg",
      scaleX: 0.37,
      scaleY: 0.41,
      zIndex: 2,
    },
  ],
} as const satisfies Record<1 | 2 | 3, readonly PreviewSlot[]>;

type RecapMonthFolderProps = {
  folderWidth?: number;
  month: RecapMonthSummary;
  onPress: (month: RecapMonthSummary) => void;
  style?: StyleProp<ViewStyle>;
};

export function RecapMonthFolder(props: RecapMonthFolderProps) {
  const { folderWidth = FOLDER_RENDER_WIDTH, month, onPress, style } = props;
  const folderScale = folderWidth / FOLDER_RENDER_WIDTH;
  const scaledFolderHeight = FOLDER_LAYOUT_HEIGHT * folderScale;
  const isDisabled =
    month.status === RecapMonthStatus.disabledEmpty ||
    month.status === RecapMonthStatus.disabledCollecting;
  const isDisabledEmpty = month.status === RecapMonthStatus.disabledEmpty;
  const isLocked = month.status === RecapMonthStatus.disabledCollecting;
  const isSelectionNeeded = month.status === RecapMonthStatus.needsSelection;
  const displayedPhotoCount =
    month.status === RecapMonthStatus.selected
      ? month.selectedPhotoIds.length
      : month.photoCount;
  const countLabel = isSelectionNeeded ? "Select photos" : displayedPhotoCount;
  const visiblePreviewPhotos = month.previewPhotos.slice(
    0,
    MAX_FOLDER_PREVIEW_PHOTOS,
  );
  const previewSlots = getPreviewSlots(visiblePreviewPhotos.length);
  const shouldShowPreview = previewSlots.length > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${month.monthLabel} recap`}
      accessibilityState={isDisabled ? { disabled: true } : undefined}
      disabled={isDisabled}
      style={[styles.card, style]}
      onPress={() => onPress(month)}
    >
      <View style={[styles.folderContent, { width: folderWidth }]}>
        <View
          style={[
            styles.folderScaleFrame,
            { height: scaledFolderHeight, width: folderWidth },
          ]}
        >
          <View
            style={[
              styles.folderScaleContent,
              {
                left: (folderWidth - FOLDER_RENDER_WIDTH) / 2,
                top: (scaledFolderHeight - FOLDER_LAYOUT_HEIGHT) / 2,
                transform: [{ scale: folderScale }],
              },
            ]}
          >
            <View style={styles.folder}>
              {isDisabledEmpty ? (
                <DisabledFolderIcon />
              ) : isLocked ? (
                <LockedFolderIcon />
              ) : (
                <>
                  <OpenFolderBack />
                  {shouldShowPreview && (
                    <View pointerEvents="none" style={styles.previewStack}>
                      {visiblePreviewPhotos.map((photo, index) => {
                        const slot = previewSlots[index];

                        return (
                          <RecapFolderPhotoCard
                            key={`${month.month}-${photo.id}`}
                            photo={photo}
                            style={toPreviewCardStyle(slot)}
                          />
                        );
                      })}
                    </View>
                  )}
                  {shouldShowPreview && (
                    <OpenFolderBlurLayer
                      photos={visiblePreviewPhotos}
                      slots={previewSlots}
                    />
                  )}
                  <OpenFolderFront />
                </>
              )}
            </View>
          </View>
        </View>
        <View
          style={[
            styles.folderLabel,
            {
              marginTop: 4 * folderScale,
              width: FOLDER_LABEL_WIDTH * folderScale,
            },
          ]}
        >
          <Text
            style={[
              styles.monthName,
              isDisabledEmpty && styles.disabledText,
              isLocked && styles.lockedText,
            ]}
          >
            {month.monthLabel}
          </Text>
          <View
            style={[
              styles.countChip,
              isSelectionNeeded && styles.needsSelectionText,
              isDisabledEmpty && styles.disabledChip,
              isLocked && styles.lockedChip,
            ]}
          >
            <Text
              style={[
                styles.countText,
                isDisabledEmpty && styles.disabledText,
                isLocked && styles.lockedText,
              ]}
            >
              {countLabel}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function getPreviewSlots(photoCount: number) {
  if (photoCount >= MAX_FOLDER_PREVIEW_PHOTOS) {
    return PREVIEW_SLOTS_BY_COUNT[3];
  }

  if (photoCount === 2) {
    return PREVIEW_SLOTS_BY_COUNT[2];
  }

  if (photoCount === 1) {
    return PREVIEW_SLOTS_BY_COUNT[1];
  }

  return [];
}

function toPreviewCardStyle(slot: PreviewSlot) {
  return {
    left: slot.centerX - PHOTO_CARD_FRAME_WIDTH / 2,
    top: slot.centerY - PHOTO_CARD_FRAME_HEIGHT / 2,
    transform: [
      { scaleX: slot.scaleX },
      { scaleY: slot.scaleY },
      { rotate: slot.rotate },
    ],
    zIndex: slot.zIndex,
  };
}

function RecapFolderPhotoCard(props: {
  photo: DailyPhoto;
  style: ReturnType<typeof toPreviewCardStyle>;
}) {
  const { photo, style } = props;

  return (
    <View style={[styles.photoCard, style]}>
      <ExpoImage
        cachePolicy="none"
        contentFit="cover"
        source={{ uri: photo.imagePath }}
        style={styles.photoImage}
      />
    </View>
  );
}

function OpenFolderBlurLayer(props: {
  photos: DailyPhoto[];
  slots: readonly PreviewSlot[];
}) {
  const { photos, slots } = props;

  return (
    <View pointerEvents="none" style={styles.frontBlurStack}>
      <View style={styles.frontBlurContent}>
        {photos.map((photo, index) => {
          const slot = slots[index];

          return (
            <RecapFolderBlurPhotoCard
              key={`${photo.id}-front-blur-${FOLDER_FRONT_BLUR_RADIUS}`}
              blurRadius={FOLDER_FRONT_BLUR_RADIUS}
              photo={photo}
              style={toPreviewCardStyle(slot)}
            />
          );
        })}
      </View>
    </View>
  );
}

function RecapFolderBlurPhotoCard(props: {
  blurRadius: number;
  photo: DailyPhoto;
  style: ReturnType<typeof toPreviewCardStyle>;
}) {
  const { blurRadius, photo, style } = props;

  return (
    <View style={[styles.photoCard, style]}>
      <NativeImage
        blurRadius={blurRadius}
        resizeMode="cover"
        source={{ uri: photo.imagePath }}
        style={styles.photoImage}
      />
    </View>
  );
}

function FolderSvg(props: { children: ReactNode; zIndex?: number }) {
  const { children, zIndex = 1 } = props;

  return (
    <Svg
      height={FOLDER_RENDER_HEIGHT}
      style={[styles.folderSvg, { zIndex }]}
      viewBox={`${FOLDER_VIEWBOX_X} ${FOLDER_VIEWBOX_Y} ${FOLDER_VIEWBOX_WIDTH} ${FOLDER_VIEWBOX_HEIGHT}`}
      width={FOLDER_RENDER_WIDTH}
    >
      {children}
    </Svg>
  );
}

function DisabledFolderIcon() {
  return (
    <View pointerEvents="none" style={styles.folderShadow}>
      <FolderSvg>
        <G transform="translate(12 0)">
          <Path
            d="M113.726 46.7662C114.832 48.4711 116.727 49.5 118.759 49.5H186C189.314 49.5 192 52.1863 192 55.5V144C192 147.314 189.314 150 186 150H46C42.6863 150 40 147.314 40 144V42C40 38.6863 42.6863 36 46 36H103.48C105.513 36 107.407 37.0289 108.513 38.7338L113.726 46.7662Z"
            fill="#DBDBDB"
          />
          <Rect fill="#E6E6E6" height={88} rx={6} width={152} x={40} y={62} />
        </G>
      </FolderSvg>
    </View>
  );
}

function LockedFolderIcon() {
  return (
    <View pointerEvents="none" style={styles.folderShadow}>
      <FolderSvg>
        <G transform="translate(12 0)">
          <Path
            d="M113.726 46.7662C114.832 48.4711 116.727 49.5 118.759 49.5H186C189.314 49.5 192 52.1863 192 55.5V144C192 147.314 189.314 150 186 150H46C42.6863 150 40 147.314 40 144V42C40 38.6863 42.6863 36 46 36H103.48C105.513 36 107.407 37.0289 108.513 38.7338L113.726 46.7662Z"
            fill="#7BD1FF"
          />
          <Rect fill="#9BDCFF" height={88} rx={6} width={152} x={40} y={62} />
          <Path
            d="M116 87C121.523 87 126 91.4772 126 97C126 100.985 123.669 104.424 120.296 106.031V120.852C120.296 123.142 118.439 125 116.148 125C113.857 125 112 123.143 112 120.852V106.165C108.469 104.622 106 101.1 106 97C106 91.4772 110.477 87 116 87Z"
            fill={appColors.white}
          />
        </G>
      </FolderSvg>
    </View>
  );
}

function OpenFolderBack() {
  return (
    <View pointerEvents="none" style={styles.folderShadow}>
      <FolderSvg zIndex={1}>
        <Path
          d="M125.561 46.7662C126.667 48.4711 128.561 49.5 130.594 49.5H197.835C201.148 49.5 203.835 52.1863 203.835 55.5V144C203.835 147.314 201.148 150 197.835 150H57.8347C54.521 150 51.8347 147.314 51.8347 144V42C51.8347 38.6863 54.521 36 57.8347 36H115.315C117.347 36 119.242 37.0289 120.348 38.7338L125.561 46.7662Z"
          fill="#7BD1FF"
        />
      </FolderSvg>
    </View>
  );
}

function OpenFolderFront() {
  return (
    <View pointerEvents="none" style={styles.frontShadow}>
      <FolderSvg zIndex={10}>
        <Path d={FRONT_FILL_PATH} fill="#8AD6FF" opacity={0.4} />
        <Path
          d={FRONT_STROKE_PATH}
          fill="none"
          opacity={0.57}
          stroke="#9BDCFF"
        />
      </FolderSvg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    marginBottom: 28,
    width: FOLDER_RENDER_WIDTH,
  },
  folderContent: {
    alignItems: "center",
    width: FOLDER_RENDER_WIDTH,
  },
  folderScaleFrame: {
    overflow: "visible",
    position: "relative",
  },
  folderScaleContent: {
    height: FOLDER_LAYOUT_HEIGHT,
    position: "absolute",
    width: FOLDER_RENDER_WIDTH,
  },
  folder: {
    height: FOLDER_LAYOUT_HEIGHT,
    position: "relative",
    width: FOLDER_RENDER_WIDTH,
  },
  folderLabel: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 24,
    width: FOLDER_LABEL_WIDTH,
  },
  folderShadow: {
    height: FOLDER_RENDER_HEIGHT,
    left: 0,
    position: "absolute",
    shadowColor: appColors.black,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: Platform.OS === "android" ? 0 : 0.1,
    shadowRadius: 20,
    top: 0,
    width: FOLDER_RENDER_WIDTH,
    zIndex: 5,
  },
  folderSvg: {
    left: 0,
    position: "absolute",
    top: 0,
  },
  frontBlurContent: {
    height: FOLDER_RENDER_HEIGHT,
    left: 0,
    position: "absolute",
    top: -FOLDER_FRONT_TOP,
    width: FOLDER_RENDER_WIDTH,
  },
  frontBlurStack: {
    height: FOLDER_RENDER_HEIGHT - FOLDER_FRONT_TOP,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    top: FOLDER_FRONT_TOP,
    width: FOLDER_RENDER_WIDTH,
    zIndex: 9,
  },
  frontShadow: {
    height: FOLDER_RENDER_HEIGHT,
    left: 0,
    position: "absolute",
    shadowColor: appColors.black,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: Platform.OS === "android" ? 0 : 0.1,
    shadowRadius: 20,
    top: 0,
    width: FOLDER_RENDER_WIDTH,
    zIndex: 10,
  },
  lockedText: {
    opacity: 0.52,
  },
  lockedChip: {
    opacity: 0.52,
  },
  photoCard: {
    alignItems: "center",
    backgroundColor: appColors.white,
    borderRadius: 20,
    height: PHOTO_CARD_FRAME_HEIGHT,
    justifyContent: "center",
    overflow: "hidden",
    position: "absolute",
    shadowColor: appColors.black,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: Platform.OS === "android" ? 0 : 0.12,
    shadowRadius: 10,
    width: PHOTO_CARD_FRAME_WIDTH,
  },
  photoImage: {
    borderRadius: 16,
    height: PHOTO_CARD_IMAGE_HEIGHT,
    width: PHOTO_CARD_IMAGE_WIDTH,
  },
  previewStack: {
    height: FOLDER_FRONT_TOP,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    top: 0,
    width: FOLDER_RENDER_WIDTH,
    zIndex: 8,
  },
  monthName: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
  },
  countChip: {
    backgroundColor: "rgba(18, 18, 18, 0.08)",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  countText: {
    color: appColors.black,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0,
    opacity: 0.7,
  },
  disabledChip: {
    backgroundColor: "rgba(138, 138, 138, 0.12)",
  },
  disabledText: {
    color: "rgba(138, 138, 138, 0.86)",
  },
  needsSelectionText: {
    opacity: 0.82,
  },
});
