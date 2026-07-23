import type { PickedImage } from "@/infrastructure/device/media/image-picker";

type ClipboardImageReadResult =
  | {
      status: "success";
      image: PickedImage;
    }
  | {
      status: "empty";
    }
  | {
      status: "denied";
    }
  | {
      status: "nativeModuleUnavailable";
    };

type ExpoClipboardModule = typeof import("expo-clipboard");

export async function readImageFromClipboard(): Promise<ClipboardImageReadResult> {
  try {
    const Clipboard = await importExpoClipboard();
    const clipboardImage = await Clipboard.getImageAsync({ format: "png" });

    if (!clipboardImage) {
      return { status: "empty" };
    }

    return {
      status: "success",
      image: {
        base64: toRawBase64(clipboardImage.data),
        fileName: null,
        mimeType: "image/png",
        uri: clipboardImage.data,
      },
    };
  } catch (error) {
    if (isClipboardPermissionError(error)) {
      return { status: "denied" };
    }

    if (isMissingNativeModuleError(error)) {
      return { status: "nativeModuleUnavailable" };
    }

    throw error;
  }
}

async function importExpoClipboard(): Promise<ExpoClipboardModule> {
  return import("expo-clipboard");
}

function toRawBase64(dataUri: string): string {
  return dataUri.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
}

function isClipboardPermissionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "NotAllowedError" || error.name === "SecurityError")
  );
}

function isMissingNativeModuleError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("Cannot find native module 'ExpoClipboard'")
  );
}
