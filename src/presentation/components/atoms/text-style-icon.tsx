import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

type TextStyleIconProps = {
  color: string;
  size: number;
  style?: StyleProp<ViewStyle>;
};

export function TextStyleIcon(props: TextStyleIconProps) {
  const { color, size, style } = props;
  const textStrokeWidth = 2.9;

  return (
    <Svg
      fill="none"
      height={size}
      style={style}
      viewBox="0 2 84 30"
      width={size * 1.65}
    >
      <Path
        d="M5 5H17.4C22.6 5 26 8.05 26 12.8C26 15.5 24.6 17.7 22.3 18.9C25.3 19.85 27.2 22.45 27.2 25.85C27.2 31 23.45 34.2 17.3 34.2H5V5ZM11.4 17H16.45C18.75 17 20.05 15.85 20.05 13.85C20.05 11.95 18.65 10.85 16.25 10.85H11.4V17ZM11.4 28.35H17C19.65 28.35 21.2 27.1 21.2 24.9C21.2 22.75 19.65 21.55 16.85 21.55H11.4V28.35Z"
        fill={color}
        fillRule="evenodd"
        transform="scale(0.86 0.9)"
      />
      <Path
        d="M31 5H49"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={textStrokeWidth}
      />
      <Path
        d="M41.5 5L34.5 27"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={textStrokeWidth}
      />
      <Path
        d="M28 27H46"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={textStrokeWidth}
      />
      <Path
        d="M55 5.3V17.4C55 24.15 58.2 27.45 64 27.45C69.8 27.45 73 24.15 73 17.4V5.3"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={textStrokeWidth}
      />
      <Path
        d="M53 31H75"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={textStrokeWidth}
      />
    </Svg>
  );
}
