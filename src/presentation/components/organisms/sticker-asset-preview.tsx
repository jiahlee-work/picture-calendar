import { memo } from "react";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import type { StickerAsset } from "@/application/services/stickers/types";
import { WidgetPreview } from "@/presentation/components/organisms/widget-preview";

type StickerAssetPreviewProps = {
  asset: StickerAsset;
  size?: "detail" | "tile";
};

export function StickerAssetPreview(props: StickerAssetPreviewProps) {
  const { asset, size = "tile" } = props;

  return (
    <View
      style={[
        styles.root,
        size === "detail" ? styles.detailRoot : styles.tileRoot,
      ]}
    >
      {asset.source === "sticker" ? (
        <UserStickerImage imagePath={asset.imagePath} />
      ) : (
        <WidgetPreview asset={asset} size={size} />
      )}
    </View>
  );
}

const UserStickerImage = memo(function UserStickerImage(props: {
  imagePath: string;
}) {
  const { imagePath } = props;

  return (
    <Image
      cachePolicy="memory-disk"
      contentFit="contain"
      source={imagePath}
      style={styles.userStickerImage}
    />
  );
});

const styles = StyleSheet.create({
  detailRoot: {
    height: "100%",
    width: "100%",
  },
  root: {
    alignItems: "center",
    justifyContent: "center",
  },
  tileRoot: {
    height: "100%",
    width: "100%",
  },
  userStickerImage: {
    height: "100%",
    width: "100%",
  },
});
