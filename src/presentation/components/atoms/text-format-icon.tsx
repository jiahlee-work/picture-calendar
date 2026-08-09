import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

type TextFormatIconProps = {
  color: string;
  size: number;
  style?: StyleProp<ViewStyle>;
};

export function TextFormatIcon(props: TextFormatIconProps) {
  const { color, size, style } = props;

  return (
    <Svg
      fill="none"
      height={size}
      style={style}
      viewBox="0 4 24 16"
      width={size}
    >
      <Path
        d="M2.65 18L7.05 6H10.08L14.48 18H11.72L10.9 15.5H6.18L5.38 18H2.65ZM6.92 13.2H10.16L8.55 8.22L6.92 13.2Z"
        fill={color}
        fillRule="evenodd"
      />
      <Path
        d="M18.03 18.18C16.1 18.18 14.76 17.07 14.76 15.43C14.76 13.76 16.06 12.78 18.36 12.61L20.32 12.47V12.03C20.32 11.16 19.76 10.66 18.8 10.66C17.92 10.66 17.36 11.05 17.2 11.72H15.14C15.31 10.03 16.77 8.94 18.9 8.94C21.18 8.94 22.45 10.1 22.45 12.08V18H20.42V16.8C19.92 17.63 19.05 18.18 18.03 18.18ZM18.64 16.55C19.6 16.55 20.32 15.88 20.32 14.97V14.01L18.67 14.13C17.49 14.22 16.93 14.62 16.93 15.33C16.93 16.08 17.58 16.55 18.64 16.55Z"
        fill={color}
        fillRule="evenodd"
      />
    </Svg>
  );
}
