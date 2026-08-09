import {
  LocalNotificationPermissionStatus,
  type LocalNotificationPermissionStatus as LocalNotificationPermissionStatusType,
} from "@/shared/notifications/types";

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
    return "이 플랫폼에서는 지원되지 않음";
  }

  if (permissionStatus === LocalNotificationPermissionStatus.granted) {
    return "권한 허용됨";
  }

  if (permissionStatus === LocalNotificationPermissionStatus.denied) {
    return "권한 필요";
  }

  return "권한 확인 전";
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
    return "모바일 앱에서 매월 1일 오전 9시에 받을 수 있어요.";
  }

  if (permissionStatus === LocalNotificationPermissionStatus.denied) {
    return "기기 설정에서 알림 권한을 허용하면 사용할 수 있어요.";
  }

  if (
    isEnabled &&
    permissionStatus === LocalNotificationPermissionStatus.granted
  ) {
    return "전월 사진이 있으면 다음 리캡 알림을 예약해요.";
  }

  return "켜면 알림 권한을 확인해요.";
}
