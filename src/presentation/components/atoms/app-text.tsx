import { forwardRef, type ComponentRef } from "react";
import {
  StyleSheet,
  Text as NativeText,
  TextInput as NativeTextInput,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from "react-native";

import { getCurrentAppLocale } from "@/application/services/localization/app-i18n";
import { resolveAppFontFamily } from "@/presentation/theme/app-typography";

export const AppText = forwardRef<ComponentRef<typeof NativeText>, TextProps>(
  function AppText(props, ref) {
    const { style, ...textProps } = props;

    return (
      <NativeText ref={ref} {...textProps} style={applyAppFontFamily(style)} />
    );
  },
);

export const AppTextInput = forwardRef<
  ComponentRef<typeof NativeTextInput>,
  TextInputProps
>(function AppTextInput(props, ref) {
  const { style, ...textInputProps } = props;

  return (
    <NativeTextInput
      ref={ref}
      {...textInputProps}
      style={applyAppFontFamily(style)}
    />
  );
});

function applyAppFontFamily(
  style: TextProps["style"] | TextInputProps["style"],
) {
  const flattenedStyle = StyleSheet.flatten(style) as TextStyle | undefined;
  const locale = getCurrentAppLocale();

  if (!flattenedStyle?.fontFamily && (locale === "ja" || locale === "zh")) {
    return style;
  }

  const fontFamily = resolveAppFontFamily({
    fontFamily: flattenedStyle?.fontFamily,
    fontWeight: flattenedStyle?.fontWeight,
  });

  if (!fontFamily) {
    return style;
  }

  return [style, { fontFamily, fontWeight: "normal" as const }];
}
