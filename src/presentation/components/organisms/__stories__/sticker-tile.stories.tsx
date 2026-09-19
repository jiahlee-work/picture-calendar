import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { WIDGET_ASSETS } from "@/application/services/stickers/sticker-assets";
import type { StickerAsset } from "@/application/services/stickers/types";
import { widgetPolaroidPreviewImageUri } from "@/presentation/assets/widget-polaroid-preview";
import { StickerTile } from "@/presentation/components/organisms/sticker-tile";
import { appColors } from "@/presentation/theme/colors";

const STICKER_ASSETS = {
  widget: WIDGET_ASSETS[0],
  widgetPolaroid: WIDGET_ASSETS[1],
  widgetSpeechBubble: WIDGET_ASSETS[3],
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

type StickerTileStoryProps = {
  assetType: keyof typeof STICKER_ASSETS;
  isSelected: boolean;
  selectionMode: boolean;
  tileSize: number;
};

function StickerTileStory(props: StickerTileStoryProps) {
  const { assetType, isSelected, selectionMode, tileSize } = props;
  const isSelectable = assetType === "sticker";

  return (
    <StickerTile
      asset={STICKER_ASSETS[assetType]}
      isSelectable={isSelectable}
      isSelected={isSelected}
      selectionMode={selectionMode}
      tileSize={tileSize}
      onOpenDetails={() => {}}
      onToggleSelection={() => {}}
    />
  );
}

const meta = {
  argTypes: {
    assetType: {
      control: "select",
      options: Object.keys(STICKER_ASSETS),
    },
    isSelected: {
      control: "boolean",
    },
    selectionMode: {
      control: "boolean",
    },
    tileSize: {
      control: {
        max: 240,
        min: 80,
        step: 8,
        type: "range",
      },
    },
  },
  component: StickerTileStory,
  decorators: [
    (Story) => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  title: "Components/Organisms/Sticker Tile",
} satisfies Meta<typeof StickerTileStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Widget: Story = {
  args: {
    assetType: "widget",
    isSelected: false,
    selectionMode: false,
    tileSize: 144,
  },
};

export const WidgetPolaroid: Story = {
  args: {
    assetType: "widgetPolaroid",
    isSelected: false,
    selectionMode: false,
    tileSize: 144,
  },
};

export const WidgetSpeechBubble: Story = {
  args: {
    assetType: "widgetSpeechBubble",
    isSelected: false,
    selectionMode: false,
    tileSize: 144,
  },
};

export const Sticker: Story = {
  args: {
    assetType: "sticker",
    isSelected: false,
    selectionMode: false,
    tileSize: 144,
  },
};

export const StickerSelectionMode: Story = {
  args: {
    assetType: "sticker",
    isSelected: false,
    selectionMode: true,
    tileSize: 144,
  },
};

export const StickerSelected: Story = {
  args: {
    assetType: "sticker",
    isSelected: true,
    selectionMode: true,
    tileSize: 144,
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
});
