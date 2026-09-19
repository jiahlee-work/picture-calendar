import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { translate } from "@/application/services/localization/app-i18n";
import { AppText } from "@/presentation/components/atoms/app-text";

export function PhotoStorageNoticeBanner() {
  return (
    <View
      accessible
      accessibilityLabel={translate("storageNotice.accessibility")}
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
        {translate("storageNotice.title")}
      </AppText>
      <View style={styles.descriptionContainer}>
        <AppText
          adjustsFontSizeToFit
          numberOfLines={2}
          style={styles.description}
        >
          {translate("storageNotice.description")}
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
