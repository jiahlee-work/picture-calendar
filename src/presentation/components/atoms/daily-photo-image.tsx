import { Image } from "expo-image";
import { StyleSheet } from "react-native";

type DailyPhotoImageProps = {
  imagePath: string;
};

export function DailyPhotoImage(props: DailyPhotoImageProps) {
  const { imagePath } = props;

  return <Image cachePolicy="none" contentFit="cover" source={{ uri: imagePath }} style={styles.image} />;
}

const styles = StyleSheet.create({
  image: {
    bottom: 0,
    height: "100%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
    zIndex: 1,
  },
});
