import { usePathname, useRouter } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppBottomNavigation,
  type AppBottomNavigationRoute,
} from "@/presentation/components/organisms/app-bottom-navigation";
import {
  getAppBottomNavigationActiveRoute,
  isAppBottomNavigationRouteActive,
} from "@/presentation/helpers/navigation/app-bottom-navigation-routes";

type AppBottomNavigationVisibility = {
  isHidden: boolean;
  setHidden: (hidden: boolean) => void;
};

const AppBottomNavigationVisibilityContext =
  createContext<AppBottomNavigationVisibility | null>(null);

export function AppBottomNavigationVisibilityProvider(props: {
  children: ReactNode;
}) {
  const { children } = props;
  const [hiddenRequestCount, setHiddenRequestCount] = useState(0);
  const setHidden = useCallback((hidden: boolean) => {
    setHiddenRequestCount((current) =>
      hidden ? current + 1 : Math.max(0, current - 1),
    );
  }, []);
  const value = useMemo(
    () => ({
      isHidden: hiddenRequestCount > 0,
      setHidden,
    }),
    [hiddenRequestCount, setHidden],
  );

  return (
    <AppBottomNavigationVisibilityContext value={value}>
      {children}
    </AppBottomNavigationVisibilityContext>
  );
}

export function useAppBottomNavigationHidden(hidden: boolean) {
  const visibility = useContext(AppBottomNavigationVisibilityContext);
  const setHidden = visibility?.setHidden;

  useEffect(() => {
    if (!hidden || !setHidden) {
      return;
    }

    setHidden(true);

    return () => {
      setHidden(false);
    };
  }, [hidden, setHidden]);
}

export function AppBottomNavigationController() {
  const insets = useSafeAreaInsets();
  const visibility = useContext(AppBottomNavigationVisibilityContext);
  const pathname = usePathname();
  const router = useRouter();
  const shouldShowNavigation = !visibility?.isHidden;

  const handleNavigate = (route: AppBottomNavigationRoute) => {
    if (isAppBottomNavigationRouteActive(pathname, route)) {
      return;
    }

    router.replace(route);
  };

  if (!shouldShowNavigation) {
    return null;
  }

  return (
    <AppBottomNavigation
      activeRoute={getAppBottomNavigationActiveRoute(pathname)}
      bottomOffset={Math.max(insets.bottom - 10, 8)}
      onNavigate={handleNavigate}
    />
  );
}
