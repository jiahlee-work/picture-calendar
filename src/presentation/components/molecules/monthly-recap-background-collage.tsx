import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import type { DailyPhoto } from "@/application/services/daily-photo/types";

const ABSOLUTE_FILL_OBJECT = {
  bottom: 0,
  left: 0,
  position: "absolute",
  right: 0,
  top: 0,
} as const;

type MonthlyRecapBackgroundCollageProps = {
  photos: DailyPhoto[];
};

export function MonthlyRecapBackgroundCollage(props: MonthlyRecapBackgroundCollageProps) {
  const { photos } = props;

  if (photos.length <= 1) {
    return (
      <Image
        contentFit="cover"
        source={{ uri: photos[0]?.imagePath }}
        style={styles.backgroundImage}
      />
    );
  }

  return (
    <View style={styles.backgroundGrid}>
      {photos.slice(0, 6).map((photo) => (
        <Image key={photo.id} contentFit="cover" source={{ uri: photo.imagePath }} style={styles.backgroundGridImage} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundGrid: {
    ...ABSOLUTE_FILL_OBJECT,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  backgroundGridImage: {
    height: "50%",
    width: "50%",
  },
  backgroundImage: {
    ...ABSOLUTE_FILL_OBJECT,
  },
});
