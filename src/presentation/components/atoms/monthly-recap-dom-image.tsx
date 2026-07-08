import type { CSSProperties } from "react";

type MonthlyRecapDomImageProps = {
  className?: string;
  src: string;
  style?: CSSProperties;
};

export function MonthlyRecapDomImage(props: MonthlyRecapDomImageProps) {
  const { className, src, style } = props;

  return <img alt="" className={["h-full w-full object-cover", className].filter(Boolean).join(" ")} src={src} style={style} />;
}
