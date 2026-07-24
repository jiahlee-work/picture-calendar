import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ReiconIcon,
  type ReiconName,
} from "@/presentation/components/atoms/reicon-icon";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";

export type AppBottomNavigationRoute =
  "/" | "/recap" | "/stickers" | "/settings";

type NavigationItem = {
  accessibilityLabel: string;
  icon: ReiconName;
  route: AppBottomNavigationRoute;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    accessibilityLabel: "캘린더로 이동",
    icon: "Calendar",
    route: "/",
  },
  {
    accessibilityLabel: "리캡으로 이동",
    icon: "Folder",
    route: "/recap",
  },
  {
    accessibilityLabel: "스티커 라이브러리로 이동",
    icon: "StickerSmile",
    route: "/stickers",
  },
  {
    accessibilityLabel: "설정으로 이동",
    icon: "Gear",
    route: "/settings",
  },
];

export function AppBottomNavigation() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const bottomOffset = Math.max(insets.bottom - 10, 8);
  const shouldShowNavigation = !pathname.startsWith("/recap/select");

  if (!shouldShowNavigation) {
    return null;
  }

  const handleNavigate = (route: AppBottomNavigationRoute) => {
    if (isRouteActive(pathname, route)) {
      return;
    }

    router.replace(route);
  };

  return (
    <AppBottomNavigationBar
      activeRoute={getActiveRoute(pathname)}
      bottomOffset={bottomOffset}
      onNavigate={handleNavigate}
    />
  );
}

type AppBottomNavigationBarProps = {
  activeRoute: AppBottomNavigationRoute;
  bottomOffset?: number;
  onNavigate: (route: AppBottomNavigationRoute) => void;
};

export function AppBottomNavigationBar(props: AppBottomNavigationBarProps) {
  const { activeRoute, bottomOffset = 8, onNavigate } = props;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.overlay, { bottom: bottomOffset }]}
    >
      <View style={styles.bar}>
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = item.route === activeRoute;

          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={item.accessibilityLabel}
              accessibilityState={{ selected: isActive }}
              key={item.route}
              style={({ pressed }) => [
                styles.item,
                isActive && styles.itemActive,
                pressed && styles.itemPressed,
              ]}
              onPress={() => onNavigate(item.route)}
            >
              <ReiconIcon
                color={appColors.black}
                name={item.icon}
                size={22}
                weight={isActive ? "Filled" : "Outline"}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getActiveRoute(pathname: string): AppBottomNavigationRoute {
  const activeRoute = NAVIGATION_ITEMS.find((item) =>
    isRouteActive(pathname, item.route),
  );

  return activeRoute?.route ?? "/";
}

function isRouteActive(pathname: string, route: AppBottomNavigationRoute) {
  if (route === "/") {
    return pathname === "/";
  }

  return pathname === route || pathname.startsWith(`${route}/`);
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    elevation: 6,
    left: 0,
    paddingHorizontal: 36,
    position: "absolute",
    right: 0,
    zIndex: appLayers.bottomNavigation,
  },
  bar: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.68)",
    borderColor: "rgba(255,255,255,0.82)",
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    height: 52,
    justifyContent: "space-between",
    maxWidth: 316,
    paddingHorizontal: 6,
    shadowColor: appColors.black,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    width: "100%",
  },
  item: {
    alignItems: "center",
    borderRadius: 21,
    flex: 1,
    height: 42,
    justifyContent: "center",
  },
  itemActive: {
    backgroundColor: "rgba(18,18,18,0.1)",
  },
  itemPressed: {
    backgroundColor: "rgba(18,18,18,0.16)",
  },
});
