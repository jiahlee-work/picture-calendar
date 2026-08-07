import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { WIDGET_ASSETS } from "@/application/services/stickers/sticker-assets";
import type { StickerAsset } from "@/application/services/stickers/types";
import { widgetPolaroidPreviewImageUri } from "@/presentation/assets/widget-polaroid-preview";
import { StickerAssetPreview } from "@/presentation/components/organisms/sticker-asset-preview";
import { appColors } from "@/presentation/theme/colors";

const STICKER_ASSETS = {
  calendar: WIDGET_ASSETS[0],
  polaroid: WIDGET_ASSETS[1],
  sticker: {
    id: "story-user-sticker",
    source: "sticker",
    userId: "storybook-user",
    imagePath: widgetPolaroidPreviewImageUri,
    storageKey: null,
    name: "사용자 스티커",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
} satisfies Record<string, StickerAsset>;

type StickerAssetPreviewStoryProps = {
  assetType: keyof typeof STICKER_ASSETS;
  size: "detail" | "tile";
};

function StickerAssetPreviewStory(props: StickerAssetPreviewStoryProps) {
  const { assetType, size } = props;

  return (
    <View style={size === "detail" ? styles.detailFrame : styles.tileFrame}>
      <StickerAssetPreview asset={STICKER_ASSETS[assetType]} size={size} />
    </View>
  );
}

const meta = {
  argTypes: {
    assetType: {
      control: "select",
      options: Object.keys(STICKER_ASSETS),
    },
    size: {
      control: "select",
      options: ["tile", "detail"],
    },
  },
  component: StickerAssetPreviewStory,
  decorators: [
    (Story) => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  title: "Components/Organisms/Sticker Asset Preview",
} satisfies Meta<typeof StickerAssetPreviewStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Calendar: Story = {
  args: {
    assetType: "calendar",
    size: "tile",
  },
};

export const Polaroid: Story = {
  args: {
    assetType: "polaroid",
    size: "tile",
  },
};

export const Sticker: Story = {
  args: {
    assetType: "sticker",
    size: "tile",
  },
};

export const Detail: Story = {
  args: {
    assetType: "calendar",
    size: "detail",
  },
};

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    backgroundColor: appColors.background,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  detailFrame: {
    height: 280,
    width: 320,
  },
  tileFrame: {
    height: 160,
    width: 160,
  },
});
