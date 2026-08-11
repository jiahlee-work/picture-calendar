import { Image } from "expo-image";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { appColors } from "@/presentation/theme/colors";

export type PolaroidPhotoFrameOrientation = "landscape" | "portrait";

type PolaroidPhotoFrameProps = {
  imagePath: string;
  onPress?: () => void;
  orientation: PolaroidPhotoFrameOrientation;
  style?: StyleProp<ViewStyle>;
};

export function PolaroidPhotoFrame(props: PolaroidPhotoFrameProps) {
  const { imagePath, onPress, orientation, style } = props;

  const imageMatte = (
    <View style={styles.imageMatte}>
      <Image
        allowDownscaling={false}
        contentFit="cover"
        source={{ uri: imagePath }}
        style={styles.fillImage}
      />
    </View>
  );

  return (
    <View
      style={[
        styles.root,
        orientation === "portrait" ? styles.portraitRoot : styles.landscapeRoot,
        style,
      ]}
    >
      {onPress ? (
        <Pressable
          accessibilityLabel="폴라로이드 사진 변경"
          accessibilityRole="button"
          onPress={onPress}
          style={styles.imageMatte}
        >
          <Image
            allowDownscaling={false}
            contentFit="cover"
            source={{ uri: imagePath }}
            style={styles.fillImage}
          />
        </Pressable>
      ) : (
        imageMatte
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fillImage: {
    height: "100%",
    width: "100%",
  },
  imageMatte: {
    backgroundColor: "#e9e9e4",
    flex: 1,
    overflow: "hidden",
  },
  landscapeRoot: {
    paddingBottom: 16,
    paddingHorizontal: 7,
    paddingTop: 7,
  },
  portraitRoot: {
    paddingBottom: 18,
    paddingHorizontal: 7,
    paddingTop: 7,
  },
  root: {
    backgroundColor: "#fffdfa",
    boxShadow: "0 7px 16px rgba(0, 0, 0, 0.18)",
    overflow: "hidden",
    position: "absolute",
    shadowColor: appColors.black,
    shadowOffset: {
      height: 7,
      width: 0,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
});
