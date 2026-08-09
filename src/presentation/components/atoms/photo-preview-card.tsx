import { Image } from "expo-image";
import { StyleSheet, View, type ViewStyle } from "react-native";

import type { DailyPhoto } from "@/shared/daily-photo/types";
import { appColors } from "@/presentation/theme/colors";

type PhotoPreviewCardProps = {
  photo?: DailyPhoto;
  style: ViewStyle;
};

export function PhotoPreviewCard(props: PhotoPreviewCardProps) {
  const { photo, style } = props;

  return (
    <View style={[styles.photoCard, style]}>
      {photo ? (
        <Image
          cachePolicy="none"
          contentFit="cover"
          source={{ uri: photo.imagePath }}
          style={styles.photoImage}
        />
      ) : (
        <View style={styles.emptyPhoto} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  photoCard: {
    backgroundColor: appColors.background,
    borderColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    borderWidth: 4,
    elevation: 3,
    height: 84,
    overflow: "hidden",
    position: "absolute",
    shadowColor: appColors.black,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: 54,
  },
  photoImage: {
    height: "100%",
    width: "100%",
  },
  emptyPhoto: {
    backgroundColor: "#e9eeec",
    height: "100%",
    width: "100%",
  },
});
