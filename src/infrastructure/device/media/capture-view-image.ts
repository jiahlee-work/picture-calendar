import {
  captureRef,
  releaseCapture,
  type CaptureOptions,
} from "react-native-view-shot";

export type CaptureViewTarget = Parameters<typeof captureRef>[0];

type CaptureViewImageOptions = {
  fileName: string;
  height?: number;
  width?: number;
};

export async function captureViewImage(
  target: CaptureViewTarget,
  options: CaptureViewImageOptions,
): Promise<string> {
  const captureOptions: CaptureOptions = {
    fileName: options.fileName,
    format: "png",
    quality: 1,
    result: "tmpfile",
  };

  if (options.height) {
    captureOptions.height = options.height;
  }

  if (options.width) {
    captureOptions.width = options.width;
  }

  return captureRef(target, captureOptions);
}

export function releaseCapturedViewImage(uri: string): void {
  releaseCapture(uri);
}
