import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/presentation/components/atoms/app-text";

export function PhotoStorageNoticeBanner() {
  return (
    <View
      accessible
      accessibilityLabel="사진은 이 기기에만 저장돼요. 앱 캐시나 데이터를 삭제하면 업로드한 사진과 스티커가 사라져요."
      style={styles.banner}
    >
      <Image
        accessible={false}
        contentFit="fill"
        pointerEvents="none"
        priority="high"
        source={require("../../../../assets/images/photo-storage-notice.png")}
        style={StyleSheet.absoluteFill}
      />
      <AppText adjustsFontSizeToFit numberOfLines={1} style={styles.title}>
        사진은 이 기기에만 저장돼요
      </AppText>
      <View style={styles.descriptionContainer}>
        <AppText
          adjustsFontSizeToFit
          numberOfLines={2}
          style={styles.description}
        >
          {"앱 캐시나 데이터를 삭제하면\n업로드한 사진과 스티커가 사라져요."}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    aspectRatio: 3,
    backgroundColor: "#000000",
    borderCurve: "continuous",
    borderRadius: 20,
    overflow: "hidden",
    width: "100%",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    left: "5.5%",
    lineHeight: 24,
    position: "absolute",
    top: "25%",
    width: "62%",
  },
  descriptionContainer: {
    left: "5.5%",
    paddingLeft: 2,
    position: "absolute",
    top: "51%",
    width: "62%",
  },
  description: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
  },
});
