import { Linking } from "react-native";

import { runtimePlatform } from "@/infrastructure/device/runtime-platform";
import { getAppUpdateStoreLinks } from "@/infrastructure/device/app-update-links";

export async function openAppUpdateStore(): Promise<void> {
  const platform = runtimePlatform === "android" ? "android" : "ios";
  const { deepLink, fallbackUrl } = getAppUpdateStoreLinks(platform);

  try {
    await Linking.openURL(deepLink);
  } catch {
    await Linking.openURL(fallbackUrl);
  }
}
