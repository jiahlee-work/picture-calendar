import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { BUILT_IN_STICKER_ASSETS } from "@/application/services/stickers/sticker-assets";
import type { StickerAsset } from "@/application/services/stickers/types";
import { builtInPolaroidPreviewImageUri } from "@/presentation/assets/built-in-polaroid-preview";
import { StickerTile } from "@/presentation/components/organisms/sticker-tile";
import { appColors } from "@/presentation/theme/colors";

const STICKER_ASSETS = {
  builtIn: BUILT_IN_STICKER_ASSETS[0],
  user: {
    id: "story-user-sticker",
    source: "user",
    userId: "storybook-user",
    imagePath: builtInPolaroidPreviewImageUri,
    storageKey: null,
    name: "사용자 스티커",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
} satisfies Record<string, StickerAsset>;

type StickerTileStoryProps = {
  assetType: keyof typeof STICKER_ASSETS;
  tileSize: number;
};

function StickerTileStory(props: StickerTileStoryProps) {
  const { assetType, tileSize } = props;

  return (
    <StickerTile
      asset={STICKER_ASSETS[assetType]}
      tileSize={tileSize}
      onOpenDetails={() => {}}
    />
  );
}

const meta = {
  argTypes: {
    assetType: {
      control: "select",
      options: Object.keys(STICKER_ASSETS),
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

export const BuiltIn: Story = {
  args: {
    assetType: "builtIn",
    tileSize: 144,
  },
};

export const UserSticker: Story = {
  args: {
    assetType: "user",
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
