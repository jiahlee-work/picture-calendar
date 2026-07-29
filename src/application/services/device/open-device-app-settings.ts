import { openAppSettings } from "@/infrastructure/device/open-app-settings";

export async function openDeviceAppSettings(): Promise<void> {
  await openAppSettings();
}
