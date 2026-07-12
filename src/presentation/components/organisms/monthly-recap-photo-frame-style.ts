import type { MonthlyRecapPhotoFrameLayout } from "@/application/services/recap/monthly-recap-template-layout";

export function toMonthlyRecapPhotoFrameStyle(
  layout: MonthlyRecapPhotoFrameLayout,
) {
  return {
    height: layout.height,
    left: layout.left,
    top: layout.top,
    transform: [{ rotate: layout.rotation }],
    width: layout.width,
    zIndex: layout.zIndex,
  };
}
