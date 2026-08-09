export type AppBottomNavigationRoute =
  "/" | "/recap" | "/stickers" | "/settings";

export const APP_BOTTOM_NAVIGATION_ROUTES: AppBottomNavigationRoute[] = [
  "/",
  "/recap",
  "/stickers",
  "/settings",
];

export function getAppBottomNavigationActiveRoute(
  pathname: string,
): AppBottomNavigationRoute {
  const activeRoute = APP_BOTTOM_NAVIGATION_ROUTES.find((route) =>
    isAppBottomNavigationRouteActive(pathname, route),
  );

  return activeRoute ?? "/";
}

export function isAppBottomNavigationRouteActive(
  pathname: string,
  route: AppBottomNavigationRoute,
) {
  if (route === "/") {
    return pathname === "/";
  }

  return pathname === route || pathname.startsWith(`${route}/`);
}
