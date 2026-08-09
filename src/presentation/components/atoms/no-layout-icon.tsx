import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

type NoLayoutIconProps = {
  color: string;
  filled?: boolean;
  size: number;
  style?: StyleProp<ViewStyle>;
};

export function NoLayoutIcon(props: NoLayoutIconProps) {
  const { color, filled = false, size, style } = props;
  const xColor = filled ? "#ffffff" : color;

  return (
    <Svg
      fill="none"
      height={size}
      style={style}
      viewBox="0 0 24 24"
      width={size}
    >
      <Path
        d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <Path
        d="M9 9L15 15"
        stroke={xColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <Path
        d="M15 9L9 15"
        stroke={xColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}
