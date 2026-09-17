import { openAppUpdateStore } from "@/infrastructure/device/open-app-update-store";

export async function openAppUpdate(): Promise<void> {
  await openAppUpdateStore();
}
