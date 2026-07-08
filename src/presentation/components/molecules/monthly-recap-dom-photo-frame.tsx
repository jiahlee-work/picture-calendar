import type { ReactNode } from "react";

import type { MonthlyRecapPhotoFrameLayout } from "@/application/services/recap/monthly-recap-template-layout";

type MonthlyRecapDomPhotoFrameProps = {
  children: ReactNode;
  className: string;
  layout: MonthlyRecapPhotoFrameLayout;
};

const BASE_CLASS_NAME = "absolute overflow-hidden";

export function MonthlyRecapDomPhotoFrame(props: MonthlyRecapDomPhotoFrameProps) {
  const { children, className, layout } = props;

  return (
    <div
      className={`${BASE_CLASS_NAME} ${className}`}
      style={{
        height: layout.height,
        left: layout.left,
        top: layout.top,
        transform: `rotate(${layout.rotation})`,
        width: layout.width,
        zIndex: layout.zIndex,
      }}
    >
      {children}
    </div>
  );
}
