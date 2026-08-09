import type { PickedImage } from "@/infrastructure/device/media/image-picker";
import { logger } from "@/infrastructure/logging/logger";
import { NativeModules, Platform } from "react-native";

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

type NativeClipboardImage = {
  data: string;
  fileName: string | null;
  mimeType: string | null;
  uri: string;
};

type PicalClipboardModule = {
  getImageAsync?: () => Promise<NativeClipboardImage | null>;
};

export async function readImageFromClipboard(): Promise<ClipboardImageReadResult> {
  try {
    const Clipboard = await importExpoClipboard();
    const clipboardImage = await Clipboard.getImageAsync({ format: "png" });

    if (clipboardImage) {
      return {
        status: "success",
        image: toPickedImageFromClipboardData(clipboardImage.data),
      };
    }

    const fallbackImage = await readAndroidClipboardImageUri();

    if (fallbackImage) {
      return {
        status: "success",
        image: fallbackImage,
      };
    }

    return { status: "empty" };
  } catch (error) {
    if (isClipboardPermissionError(error)) {
      logger.warn("Clipboard image read denied", { error });
      return { status: "denied" };
    }

    if (isMissingNativeModuleError(error)) {
      logger.warn("Clipboard image native module unavailable", { error });
      return { status: "nativeModuleUnavailable" };
    }

    logger.error("Clipboard image read failed before registration", { error });
    throw error;
  }
}

async function importExpoClipboard(): Promise<ExpoClipboardModule> {
  return import("expo-clipboard");
}

export function toPickedImageFromClipboardData(dataUri: string): PickedImage {
  return {
    base64: toRawBase64(dataUri),
    fileName: null,
    mimeType: imageMimeTypeFromDataUri(dataUri) ?? "image/png",
    uri: dataUri,
  };
}

async function readAndroidClipboardImageUri(): Promise<PickedImage | null> {
  if (Platform.OS !== "android") {
    return null;
  }

  const nativeImage = await readAndroidNativeClipboardImage();

  if (nativeImage) {
    return {
      base64: toRawBase64(nativeImage.data),
      fileName: nativeImage.fileName,
      mimeType: imageMimeTypeFromDataUri(nativeImage.data) ?? "image/png",
      uri: nativeImage.data,
    };
  }

  return null;
}

async function readAndroidNativeClipboardImage(): Promise<NativeClipboardImage | null> {
  const PicalClipboard = NativeModules.PicalClipboard as
    PicalClipboardModule | undefined;

  try {
    return (await PicalClipboard?.getImageAsync?.()) ?? null;
  } catch (error) {
    logger.warn("Android native clipboard image read failed", { error });
    return null;
  }
}

function toRawBase64(dataUri: string): string {
  return dataUri.replace(
    /^data:image\/[a-zA-Z0-9.+-]+(?:;[a-zA-Z0-9=.+-]+)*;base64,/,
    "",
  );
}

function imageMimeTypeFromDataUri(dataUri: string): string | null {
  return dataUri.match(/^data:(image\/[a-zA-Z0-9.+-]+);/)?.[1] ?? null;
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
