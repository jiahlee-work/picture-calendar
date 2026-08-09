import { Linking } from "react-native";

export async function openAppSettings(): Promise<void> {
  await Linking.openSettings();
}
