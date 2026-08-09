import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

type TextStyleIconProps = {
  color: string;
  size: number;
  style?: StyleProp<ViewStyle>;
};

export function TextStyleIcon(props: TextStyleIconProps) {
  const { color, size, style } = props;
  const textStrokeWidth = 2.35;

  return (
    <Svg
      fill="none"
      height={size}
      style={style}
      viewBox="0 2 76 30"
      width={size * 1.65}
    >
      <Path
        d="M5 5H17.4C22.6 5 26 8.05 26 12.8C26 15.45 24.65 17.65 22.35 18.85C25.35 19.82 27.25 22.42 27.25 25.8C27.25 31 23.48 34.2 17.35 34.2H5V5ZM11.45 17H16.45C18.78 17 20.08 15.85 20.08 13.85C20.08 11.92 18.68 10.82 16.25 10.82H11.45V17ZM11.45 28.38H17.05C19.68 28.38 21.22 27.12 21.22 24.9C21.22 22.75 19.68 21.55 16.88 21.55H11.45V28.38Z"
        fill={color}
        fillRule="evenodd"
        transform="translate(0 -0.8) scale(0.86 0.9)"
      />
      <Path
        d="M33 5H41"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={textStrokeWidth}
      />
      <Path
        d="M38 5L31.6 30"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={textStrokeWidth}
      />
      <Path
        d="M28.6 30H36.6"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={textStrokeWidth}
      />
      <Path
        d="M47.8 5.3V17.35C47.8 24.1 50.5 27.45 55 27.45C59.5 27.45 62.2 24.1 62.2 17.35V5.3"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={textStrokeWidth}
      />
      <Path
        d="M46 31H64"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={textStrokeWidth}
      />
    </Svg>
  );
}
