import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  type LayoutChangeEvent,
  View,
} from "react-native";

import {
  ReiconIcon,
  type ReiconName,
} from "@/presentation/components/atoms/reicon-icon";
import {
  type AppBottomNavigationItemLayout,
  getAppBottomNavigationActiveIndex,
  getAppBottomNavigationAnimationDuration,
  getAppBottomNavigationItemLayout,
} from "@/presentation/helpers/navigation/app-bottom-navigation-layout";
import type { AppBottomNavigationRoute } from "@/presentation/helpers/navigation/app-bottom-navigation-routes";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";

export type { AppBottomNavigationRoute };

type NavigationItem = {
  accessibilityLabel: string;
  icon: ReiconName;
  route: AppBottomNavigationRoute;
};

type AppBottomNavigationProps = {
  activeRoute: AppBottomNavigationRoute;
  bottomOffset?: number;
  onNavigate: (route: AppBottomNavigationRoute) => void;
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
    accessibilityLabel: "라이브러리로 이동",
    icon: "StickerSmile",
    route: "/stickers",
  },
  {
    accessibilityLabel: "설정으로 이동",
    icon: "Gear",
    route: "/settings",
  },
];
const NAVIGATION_ITEM_ROUTES = NAVIGATION_ITEMS.map((item) => item.route);

const NAVIGATION_ANIMATION_MIN_DURATION_MS = 140;
const NAVIGATION_ANIMATION_STEP_DURATION_MS = 42;
const NAVIGATION_ANIMATION_MAX_DURATION_MS = 260;
const NAVIGATION_ANIMATION_EASING = Easing.bezier(0.22, 1, 0.36, 1);
const NAVIGATION_BAR_HORIZONTAL_PADDING = 6;
const NAVIGATION_ITEM_GAP = 4;
const NAVIGATION_ITEM_HEIGHT = 42;
const NAVIGATION_ITEM_TOP = 5;

export function AppBottomNavigation(props: AppBottomNavigationProps) {
  const { activeRoute, bottomOffset = 8, onNavigate } = props;
  const activeIndex = getAppBottomNavigationActiveIndex(
    NAVIGATION_ITEM_ROUTES,
    activeRoute,
  );
  const hasMountedRef = useRef(false);
  const pillIndexRef = useRef(activeIndex);
  const visualRouteUpdateTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [pillTranslateX] = useState(() => new Animated.Value(0));
  const [pillWidth] = useState(() => new Animated.Value(0));
  const [visualActiveRoute, setVisualActiveRoute] = useState(activeRoute);
  const [itemLayouts, setItemLayouts] = useState<
    (AppBottomNavigationItemLayout | null)[]
  >(() => NAVIGATION_ITEMS.map(() => null));
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  const activeItemLayout = getAppBottomNavigationItemLayout(
    itemLayouts,
    activeIndex,
  );
  const shouldRenderPill = activeItemLayout !== null;
  const movePillToLayout = useCallback(
    (layout: AppBottomNavigationItemLayout, durationMs: number) => {
      if (durationMs <= 0) {
        hasMountedRef.current = true;
        pillTranslateX.setValue(layout.left);
        pillWidth.setValue(layout.width);
        return;
      }

      Animated.parallel([
        Animated.timing(pillTranslateX, {
          duration: durationMs,
          easing: NAVIGATION_ANIMATION_EASING,
          toValue: layout.left,
          useNativeDriver: false,
        }),
        Animated.timing(pillWidth, {
          duration: durationMs,
          easing: NAVIGATION_ANIMATION_EASING,
          toValue: layout.width,
          useNativeDriver: false,
        }),
      ]).start();
    },
    [pillTranslateX, pillWidth],
  );
  const scheduleVisualActiveRoute = useCallback(
    (route: AppBottomNavigationRoute, delayMs: number) => {
      if (visualRouteUpdateTimerRef.current) {
        clearTimeout(visualRouteUpdateTimerRef.current);
      }

      if (delayMs <= 0) {
        setVisualActiveRoute(route);
        visualRouteUpdateTimerRef.current = null;
        return;
      }

      visualRouteUpdateTimerRef.current = setTimeout(() => {
        setVisualActiveRoute(route);
        visualRouteUpdateTimerRef.current = null;
      }, delayMs);
    },
    [setVisualActiveRoute],
  );

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
      if (isMounted) {
        setIsReduceMotionEnabled(isEnabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setIsReduceMotionEnabled,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(
    () => () => {
      if (visualRouteUpdateTimerRef.current) {
        clearTimeout(visualRouteUpdateTimerRef.current);
      }
    },
    [],
  );

  useLayoutEffect(() => {
    if (activeItemLayout) {
      const durationMs =
        !hasMountedRef.current || isReduceMotionEnabled
          ? 0
          : getAppBottomNavigationAnimationDuration({
              fromIndex: pillIndexRef.current,
              maxDurationMs: NAVIGATION_ANIMATION_MAX_DURATION_MS,
              minDurationMs: NAVIGATION_ANIMATION_MIN_DURATION_MS,
              stepDurationMs: NAVIGATION_ANIMATION_STEP_DURATION_MS,
              toIndex: activeIndex,
            });

      movePillToLayout(activeItemLayout, durationMs);
      scheduleVisualActiveRoute(activeRoute, durationMs);
      pillIndexRef.current = activeIndex;
    }
  }, [
    activeItemLayout,
    activeIndex,
    activeRoute,
    isReduceMotionEnabled,
    movePillToLayout,
    scheduleVisualActiveRoute,
  ]);

  const handleItemLayout = (index: number, event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;
    const nextLayout = {
      left: Math.round(x),
      width: Math.round(width),
    };

    setItemLayouts((currentLayouts) => {
      const currentLayout = currentLayouts[index];

      if (
        currentLayout?.left === nextLayout.left &&
        currentLayout.width === nextLayout.width
      ) {
        return currentLayouts;
      }

      const nextLayouts = [...currentLayouts];

      nextLayouts[index] = nextLayout;

      return nextLayouts;
    });
  };

  const handleNavigate = (item: NavigationItem) => {
    onNavigate(item.route);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.overlay, { bottom: bottomOffset }]}
    >
      <View style={styles.bar}>
        {shouldRenderPill && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activePill,
              {
                transform: [{ translateX: pillTranslateX }],
                width: pillWidth,
              },
            ]}
          />
        )}
        {NAVIGATION_ITEMS.map((item, itemIndex) => {
          const isActive = item.route === activeRoute;
          const isVisuallyActive = item.route === visualActiveRoute;

          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={item.accessibilityLabel}
              accessibilityState={{ selected: isActive }}
              key={item.route}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
              onLayout={(event) => handleItemLayout(itemIndex, event)}
              onPress={() => handleNavigate(item)}
            >
              <ReiconIcon
                color={appColors.black}
                name={item.icon}
                size={22}
                weight={isVisuallyActive ? "Filled" : "Outline"}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activePill: {
    backgroundColor: "rgba(18,18,18,0.1)",
    borderRadius: 21,
    height: NAVIGATION_ITEM_HEIGHT,
    left: 0,
    position: "absolute",
    top: NAVIGATION_ITEM_TOP,
    zIndex: 0,
  },
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
    gap: NAVIGATION_ITEM_GAP,
    height: 52,
    justifyContent: "space-between",
    maxWidth: 316,
    paddingHorizontal: NAVIGATION_BAR_HORIZONTAL_PADDING,
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
    height: NAVIGATION_ITEM_HEIGHT,
    justifyContent: "center",
    zIndex: 1,
  },
  itemPressed: {
    opacity: 0.68,
  },
});
