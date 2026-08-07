import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { WIDGET_ASSETS } from "@/application/services/stickers/sticker-assets";
import type { StickerAsset } from "@/application/services/stickers/types";
import { widgetPolaroidPreviewImageUri } from "@/presentation/assets/widget-polaroid-preview";
import { StickerDetailSheet } from "@/presentation/components/organisms/sticker-detail-sheet";
import { appColors } from "@/presentation/theme/colors";

const STICKER_ASSETS = {
  widget: WIDGET_ASSETS[0],
  sticker: {
    id: "story-user-sticker",
    source: "sticker",
    userId: "storybook-user",
    imagePath: widgetPolaroidPreviewImageUri,
    storageKey: null,
    name: "사용자 스티커",
    createdAt: "2026-07-01T00:00:00.000Z",
    isFavorite: true,
  },
} satisfies Record<string, StickerAsset>;

type StickerDetailSheetStoryProps = {
  assetType: keyof typeof STICKER_ASSETS;
  isSaving: boolean;
};

function StickerDetailSheetStory(props: StickerDetailSheetStoryProps) {
  const { assetType, isSaving } = props;
  const [visible, setVisible] = useState(true);

  return (
    <BottomSheetModalProvider>
      <View style={styles.canvas}>
        {!visible && (
          <Pressable style={styles.openButton} onPress={() => setVisible(true)}>
            <Text style={styles.openButtonLabel}>상세 시트 열기</Text>
          </Pressable>
        )}
        <StickerDetailSheet
          asset={STICKER_ASSETS[assetType]}
          isSaving={isSaving}
          visible={visible}
          onClose={() => setVisible(false)}
          onDeleteUserSticker={async () => true}
          onToggleUserStickerFavorite={async () => true}
        />
      </View>
    </BottomSheetModalProvider>
  );
}

const meta = {
  argTypes: {
    assetType: {
      control: "select",
      options: Object.keys(STICKER_ASSETS),
    },
    isSaving: {
      control: "boolean",
    },
  },
  component: StickerDetailSheetStory,
  title: "Components/Organisms/Sticker Detail Sheet",
} satisfies Meta<typeof StickerDetailSheetStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Widget: Story = {
  args: {
    assetType: "widget",
    isSaving: false,
  },
};

export const Sticker: Story = {
  args: {
    assetType: "sticker",
    isSaving: false,
  },
};

export const Saving: Story = {
  args: {
    assetType: "sticker",
    isSaving: true,
  },
};

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  openButton: {
    backgroundColor: appColors.black,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  openButtonLabel: {
    color: appColors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});
