import { Fragment, type ReactNode } from "react";
import { useLocales } from "expo-localization";

import { configureAppLocale } from "@/application/services/localization/app-i18n";
import { resolveAppLocale } from "@/application/services/localization/app-locale";

type AppLocalizationProviderProps = {
  children: ReactNode;
};

export function AppLocalizationProvider(props: AppLocalizationProviderProps) {
  const { children } = props;
  const locales = useLocales();
  const locale = resolveAppLocale(locales[0]?.languageCode);

  configureAppLocale(locale);

  return <Fragment key={locale}>{children}</Fragment>;
}
