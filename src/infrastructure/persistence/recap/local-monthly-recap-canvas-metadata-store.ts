import { Directory, File, Paths } from "expo-file-system";

import type {
  MonthlyRecapCanvas,
  MonthlyRecapCanvasMetadataStore,
  RecapCanvasElement,
  RecapCanvasElementType,
  RecapCanvasLayoutId,
  RecapCanvasLayoutState,
} from "@/shared/recap/types";
import { RecapCanvasLayoutId as RecapCanvasLayoutIdValue } from "@/shared/recap/types";
import { parseRecapCanvasTextMetadata } from "@/infrastructure/persistence/recap/recap-canvas-text-metadata";

const MONTHLY_RECAP_CANVASES_DIRECTORY_NAME = "monthly-recap-canvases";
const METADATA_FILE_NAME = "metadata.json";

export function createLocalMonthlyRecapCanvasMetadataStore(): MonthlyRecapCanvasMetadataStore {
  const directory = new Directory(
    Paths.document,
    MONTHLY_RECAP_CANVASES_DIRECTORY_NAME,
  );
  const file = new File(directory, METADATA_FILE_NAME);

  return {
    async load() {
      if (!file.exists) {
        return [];
      }

      const contents = await file.text();

      if (!contents.trim()) {
        return [];
      }

      const parsed = JSON.parse(contents);

      return Array.isArray(parsed)
        ? parsed.map(toMonthlyRecapCanvas).filter(isMonthlyRecapCanvas)
        : [];
    },
    async save(canvases) {
      directory.create({
        idempotent: true,
        intermediates: true,
      });

      if (!file.exists) {
        file.create({
          intermediates: true,
          overwrite: true,
        });
      }

      file.write(JSON.stringify(canvases, null, 2));
    },
  };
}

function isMonthlyRecapCanvas(
  canvas: MonthlyRecapCanvas | null,
): canvas is MonthlyRecapCanvas {
  return canvas !== null;
}

function toMonthlyRecapCanvas(value: unknown): MonthlyRecapCanvas | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  const userId = stringValue(value.userId);
  const month = stringValue(value.month);
  const createdAt = stringValue(value.createdAt);
  const updatedAt = stringValue(value.updatedAt);

  if (!id || !userId || !month || !createdAt || !updatedAt) {
    return null;
  }

  return {
    backgroundColor: stringValue(value.backgroundColor) ?? undefined,
    id,
    userId,
    month,
    layout: layoutValue(value.layout),
    elements: elementArrayValue(value.elements),
    createdAt,
    updatedAt,
  };
}

function layoutValue(value: unknown): RecapCanvasLayoutState | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const layoutId = layoutIdValue(value.layoutId);

  if (!layoutId || !isObjectRecord(value.slotPhotoIds)) {
    return null;
  }

  return {
    layoutId,
    slotPhotoIds: slotPhotoIdsValue(value.slotPhotoIds),
  };
}

function elementArrayValue(value: unknown): RecapCanvasElement[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(toRecapCanvasElement).filter(isRecapCanvasElement);
}

function isRecapCanvasElement(
  element: RecapCanvasElement | null,
): element is RecapCanvasElement {
  return element !== null;
}

function toRecapCanvasElement(value: unknown): RecapCanvasElement | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const base = baseElementValue(value);

  if (!base) {
    return null;
  }

  if (base.type === "photo") {
    const photoId = stringValue(value.photoId);

    return photoId
      ? {
          ...base,
          height: positiveNumberValue(value.height) ?? undefined,
          photoId,
          type: "photo",
          width: positiveNumberValue(value.width) ?? undefined,
        }
      : null;
  }

  if (base.type === "sticker") {
    const stickerAssetId = stringValue(value.stickerAssetId);

    return stickerAssetId ? { ...base, stickerAssetId, type: "sticker" } : null;
  }

  if (base.type === "text") {
    return parseRecapCanvasTextMetadata(value, base);
  }

  if (base.type === "widget") {
    if (value.variant === "calendar") {
      return { ...base, type: "widget", variant: "calendar" };
    }

    if (value.variant === "speechBubble") {
      return {
        ...base,
        text: stringValue(value.text) ?? "",
        type: "widget",
        variant: "speechBubble",
      };
    }

    if (
      value.variant === "polaroidFrame" ||
      value.variant === "polaroidFramePortrait"
    ) {
      return {
        ...base,
        photoId: stringValue(value.photoId) ?? undefined,
        type: "widget",
        variant: value.variant,
      };
    }
  }

  return null;
}

function baseElementValue(value: Record<string, unknown>) {
  const id = stringValue(value.id);
  const type = elementTypeValue(value.type);
  const x = numberValue(value.x);
  const y = numberValue(value.y);
  const scale = numberValue(value.scale);
  const rotation = numberValue(value.rotation);
  const zIndex = numberValue(value.zIndex);

  if (
    !id ||
    !type ||
    x === null ||
    y === null ||
    scale === null ||
    rotation === null ||
    zIndex === null
  ) {
    return null;
  }

  return {
    id,
    type,
    x,
    y,
    scale,
    rotation,
    zIndex,
    opacity: numberValue(value.opacity) ?? undefined,
  };
}

function positiveNumberValue(value: unknown): number | null {
  const number = numberValue(value);

  return number !== null && number > 0 ? number : null;
}

function layoutIdValue(value: unknown): RecapCanvasLayoutId | null {
  if (
    value === RecapCanvasLayoutIdValue.twoColumns ||
    value === RecapCanvasLayoutIdValue.twoRows ||
    value === RecapCanvasLayoutIdValue.threeRows ||
    value === RecapCanvasLayoutIdValue.fourGrid ||
    value === RecapCanvasLayoutIdValue.onePhoto
  ) {
    return value;
  }

  return null;
}

function slotPhotoIdsValue(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string | null] => {
        const [, photoId] = entry;

        return photoId === null || typeof photoId === "string";
      })
      .map(([slotId, photoId]) => [slotId, photoId]),
  );
}

function elementTypeValue(value: unknown): RecapCanvasElementType | null {
  if (
    value === "photo" ||
    value === "sticker" ||
    value === "text" ||
    value === "widget"
  ) {
    return value;
  }

  return null;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
