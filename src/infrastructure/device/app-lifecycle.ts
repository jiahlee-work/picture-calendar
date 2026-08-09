import { AppState } from "react-native";

export type AppActiveSubscription = {
  remove: () => void;
};

export function subscribeToAppActive(
  listener: () => void,
): AppActiveSubscription {
  return AppState.addEventListener("change", (nextAppState) => {
    if (nextAppState === "active") {
      listener();
    }
  });
}
