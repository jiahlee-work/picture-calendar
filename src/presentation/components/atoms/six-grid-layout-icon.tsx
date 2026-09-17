import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

type SixGridLayoutIconProps = {
  color: string;
  filled?: boolean;
  size: number;
  style?: StyleProp<ViewStyle>;
};

export function SixGridLayoutIcon(props: SixGridLayoutIconProps) {
  const { color, filled = false, size, style } = props;
  const innerLineColor = filled ? "#ffffff" : color;

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
        d="M12 2V22M2 8.6667H22M2 15.3333H22"
        stroke={innerLineColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </Svg>
  );
}
