import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { MonthlyRecapDomImage } from "@/presentation/components/atoms/monthly-recap-dom-image";

type MonthlyRecapDomBackgroundCollageProps = {
  photos: DailyPhoto[];
};

export function MonthlyRecapDomBackgroundCollage(props: MonthlyRecapDomBackgroundCollageProps) {
  const { photos } = props;

  if (photos.length <= 1) {
    const photo = photos[0];

    return photo ? <MonthlyRecapDomImage className="absolute inset-0" src={photo.imagePath} /> : null;
  }

  return (
    <div className="absolute inset-0 flex flex-wrap">
      {photos.slice(0, 6).map((photo) => (
        <MonthlyRecapDomImage key={photo.id} className="h-1/2 w-1/2" src={photo.imagePath} />
      ))}
    </div>
  );
}
