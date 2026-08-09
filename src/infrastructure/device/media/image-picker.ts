import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export type PickedImage = {
  base64: string | null;
  fileName: string | null;
  mimeType: string | null;
  uri: string;
};

export async function pickImageFromLibrary(): Promise<PickedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: false,
    base64: Platform.OS === "android",
    mediaTypes: ["images"],
    preferredAssetRepresentationMode:
      ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    quality: 0.9,
    shouldDownloadFromNetwork: true,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return {
    base64: result.assets[0].base64 ?? null,
    fileName: result.assets[0].fileName ?? null,
    mimeType: result.assets[0].mimeType ?? null,
    uri: result.assets[0].uri,
  };
}
