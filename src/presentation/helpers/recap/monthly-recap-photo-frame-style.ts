import type { MonthlyRecapPhotoFrameLayout } from "@/presentation/helpers/recap/monthly-recap-template-layout";

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
