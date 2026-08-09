import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { WIDGET_ASSETS } from "@/application/services/stickers/sticker-assets";
import type {
  StickerAsset,
  StickerPlacement,
} from "@/application/services/stickers/types";
import { widgetPolaroidPreviewImageUri } from "@/presentation/assets/widget-polaroid-preview";
import { StickerDecoratingCanvas } from "@/presentation/components/organisms/sticker-decorating-canvas";
import { appColors } from "@/presentation/theme/colors";

const STICKER_ASSETS = [
  ...WIDGET_ASSETS,
  {
    id: "story-user-sticker",
    source: "sticker",
    userId: "storybook-user",
    imagePath: widgetPolaroidPreviewImageUri,
    storageKey: null,
    name: "사용자 스티커",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
] satisfies StickerAsset[];

const INITIAL_PLACEMENTS: StickerPlacement[] = [
  {
    id: "calendar-placement",
    assetId: "widget-calendar",
    pageType: "calendarRecap",
    pageId: "storybook-recap",
    x: 36,
    y: 62,
    scale: 1.15,
    rotation: -4,
    zIndex: 1,
    widgetState: {
      variant: "calendar",
      date: "2026-07-24",
    },
  },
  {
    id: "user-sticker-placement",
    assetId: "story-user-sticker",
    pageType: "calendarRecap",
    pageId: "storybook-recap",
    x: 180,
    y: 244,
    scale: 0.84,
    rotation: 10,
    zIndex: 2,
  },
];

function StickerDecoratingCanvasStory() {
  const [placements, setPlacements] = useState(INITIAL_PLACEMENTS);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(
    INITIAL_PLACEMENTS[0].id,
  );

  return (
    <View style={styles.frame}>
      <StickerDecoratingCanvas
        assets={STICKER_ASSETS}
        placements={placements}
        selectedPlacementId={selectedPlacementId}
        style={styles.canvas}
        onChangePlacement={(nextPlacement) => {
          setPlacements((currentPlacements) =>
            currentPlacements.map((placement) =>
              placement.id === nextPlacement.id ? nextPlacement : placement,
            ),
          );
        }}
        onChangePlacements={setPlacements}
        onSelectPlacement={setSelectedPlacementId}
      >
        <View style={styles.background} />
      </StickerDecoratingCanvas>
    </View>
  );
}

const meta = {
  component: StickerDecoratingCanvasStory,
  decorators: [
    (Story) => (
      <View style={styles.storyRoot}>
        <Story />
      </View>
    ),
  ],
  title: "Components/Organisms/Sticker Decorating Canvas",
} satisfies Meta<typeof StickerDecoratingCanvasStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#f0ebe3",
    borderColor: "#e0d8ca",
    borderWidth: 1,
    flex: 1,
  },
  canvas: {
    borderRadius: 16,
  },
  frame: {
    height: 520,
    width: 360,
  },
  storyRoot: {
    alignItems: "center",
    backgroundColor: appColors.background,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
});
