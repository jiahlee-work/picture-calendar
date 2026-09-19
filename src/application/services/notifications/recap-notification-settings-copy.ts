import {
  LocalNotificationPermissionStatus,
  type LocalNotificationPermissionStatus as LocalNotificationPermissionStatusType,
} from "@/shared/notifications/types";
import { translate } from "@/application/services/localization/app-i18n";

export function toRecapNotificationStatusCopy({
  isSupported,
  permissionStatus,
}: {
  isSupported: boolean;
  permissionStatus: LocalNotificationPermissionStatusType;
}): string {
  if (
    !isSupported ||
    permissionStatus === LocalNotificationPermissionStatus.unsupported
  ) {
    return translate("notifications.unsupported");
  }

  if (permissionStatus === LocalNotificationPermissionStatus.granted) {
    return translate("notifications.granted");
  }

  if (permissionStatus === LocalNotificationPermissionStatus.denied) {
    return translate("notifications.permissionRequired");
  }

  return translate("notifications.statusUnknown");
}

export function toRecapNotificationHelperCopy({
  isEnabled,
  isSupported,
  permissionStatus,
}: {
  isEnabled: boolean;
  isSupported: boolean;
  permissionStatus: LocalNotificationPermissionStatusType;
}): string {
  if (
    !isSupported ||
    permissionStatus === LocalNotificationPermissionStatus.unsupported
  ) {
    return translate("notifications.unsupportedHelper");
  }

  if (permissionStatus === LocalNotificationPermissionStatus.denied) {
    return translate("notifications.deniedHelper");
  }

  if (
    isEnabled &&
    permissionStatus === LocalNotificationPermissionStatus.granted
  ) {
    return translate("notifications.enabledHelper");
  }

  return translate("notifications.enableHelper");
}
