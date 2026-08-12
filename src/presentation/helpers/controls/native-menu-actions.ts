import { runtimePlatform } from "@/infrastructure/device/runtime-platform";

export function orderNativeMenuActions<Action>(actions: readonly Action[]) {
  const orderedActions = [...actions];

  return runtimePlatform === "ios" ? orderedActions.reverse() : orderedActions;
}
