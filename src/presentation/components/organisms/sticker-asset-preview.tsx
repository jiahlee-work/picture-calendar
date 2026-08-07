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
        <Image
          cachePolicy="none"
          contentFit="contain"
          source={{ uri: asset.imagePath }}
          style={styles.userStickerImage}
        />
      ) : (
        <WidgetPreview asset={asset} size={size} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  detailRoot: {
    height: 260,
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
