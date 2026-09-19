import { type ImageRef, useImage } from "expo-image";
import { createContext, type PropsWithChildren, use } from "react";

export const photoStorageNoticeImageSource = require("../../../assets/images/photo-storage-notice.png");

const PhotoStorageNoticeImageContext = createContext<ImageRef | null>(null);

export function PhotoStorageNoticeImageProvider(props: PropsWithChildren) {
  // Retain the full-resolution decoded bitmap across screen changes.
  const image = useImage(photoStorageNoticeImageSource);

  return (
    <PhotoStorageNoticeImageContext value={image}>
      {props.children}
    </PhotoStorageNoticeImageContext>
  );
}

export function usePhotoStorageNoticeImage() {
  return use(PhotoStorageNoticeImageContext);
}
