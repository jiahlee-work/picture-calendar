import { translate } from "@/application/services/localization/app-i18n";

export const ShareSaveToastState = {
  failed: "failed",
  hidden: "hidden",
  saved: "saved",
  saving: "saving",
} as const;

export type ShareSaveToastState =
  (typeof ShareSaveToastState)[keyof typeof ShareSaveToastState];

export function toShareSaveToastMessage(state: ShareSaveToastState) {
  if (state === ShareSaveToastState.saving) {
    return translate("sharing.saving");
  }

  if (state === ShareSaveToastState.saved) {
    return translate("sharing.saved");
  }

  if (state === ShareSaveToastState.failed) {
    return translate("sharing.saveFailed");
  }

  return "";
}
