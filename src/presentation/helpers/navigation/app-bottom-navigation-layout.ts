import type { AppBottomNavigationRoute } from "@/presentation/helpers/navigation/app-bottom-navigation-routes";

export type AppBottomNavigationItemLayout = {
  left: number;
  width: number;
};

export function getAppBottomNavigationActiveIndex(
  routes: AppBottomNavigationRoute[],
  activeRoute: AppBottomNavigationRoute,
) {
  return Math.max(getAppBottomNavigationItemIndex(routes, activeRoute), 0);
}

export function getAppBottomNavigationItemIndex(
  routes: AppBottomNavigationRoute[],
  route: AppBottomNavigationRoute,
) {
  return routes.findIndex((itemRoute) => itemRoute === route);
}

export function getAppBottomNavigationItemLayout(
  itemLayouts: (AppBottomNavigationItemLayout | null)[],
  itemIndex: number,
) {
  return itemLayouts[itemIndex] ?? null;
}

export function getAppBottomNavigationAnimationDuration({
  fromIndex,
  maxDurationMs,
  minDurationMs,
  stepDurationMs,
  toIndex,
}: {
  fromIndex: number;
  maxDurationMs: number;
  minDurationMs: number;
  stepDurationMs: number;
  toIndex: number;
}) {
  const distance = Math.abs(toIndex - fromIndex);

  return Math.min(maxDurationMs, minDurationMs + distance * stepDurationMs);
}
