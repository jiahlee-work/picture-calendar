import { translate } from "@/application/services/localization/app-i18n";

export function toMediaLibraryPermissionMessage(canAskAgain: boolean) {
  if (canAskAgain) {
    return translate("permissions.requestStorageMessage");
  }

  return translate("permissions.settingsStorageMessage");
}
