export type AppUpdateStorePlatform = "android" | "ios";

export type AppUpdateStoreLinks = {
  deepLink: string;
  fallbackUrl: string;
};

const ANDROID_PACKAGE_NAME = "com.jiahleework.pical";
const IOS_APP_STORE_SEARCH_TERM = "Pical";

export function getAppUpdateStoreLinks(
  platform: AppUpdateStorePlatform,
): AppUpdateStoreLinks {
  if (platform === "android") {
    const query = `id=${ANDROID_PACKAGE_NAME}`;

    return {
      deepLink: `market://details?${query}`,
      fallbackUrl: `https://play.google.com/store/apps/details?${query}`,
    };
  }

  const encodedSearchTerm = encodeURIComponent(IOS_APP_STORE_SEARCH_TERM);

  return {
    deepLink: `itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/search?term=${encodedSearchTerm}`,
    fallbackUrl: `https://apps.apple.com/kr/search?term=${encodedSearchTerm}`,
  };
}
