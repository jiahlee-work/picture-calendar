import { Directory, File, Paths } from "expo-file-system";

import type {
  WidgetPlacementState,
  StickerPlacementMetadataStore,
  StickerPlacementPageType,
  StoredStickerPlacement,
} from "@/shared/stickers/types";

const STICKERS_DIRECTORY_NAME = "stickers";
const PLACEMENTS_FILE_NAME = "placements.json";

export function createLocalStickerPlacementMetadataStore(): StickerPlacementMetadataStore {
  const directory = new Directory(Paths.document, STICKERS_DIRECTORY_NAME);
  const file = new File(directory, PLACEMENTS_FILE_NAME);

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
        ? parsed.map(toStoredStickerPlacement).filter(isStoredStickerPlacement)
        : [];
    },
    async save(placements) {
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

      file.write(JSON.stringify(placements, null, 2));
    },
  };
}

function isStoredStickerPlacement(
  placement: StoredStickerPlacement | null,
): placement is StoredStickerPlacement {
  return placement !== null;
}

function toStoredStickerPlacement(
  value: unknown,
): StoredStickerPlacement | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  const assetId = stringValue(value.assetId);
  const userId = stringValue(value.userId);
  const pageType = pageTypeValue(value.pageType);
  const pageId = stringValue(value.pageId);
  const x = numberValue(value.x);
  const y = numberValue(value.y);
  const scale = numberValue(value.scale);
  const rotation = numberValue(value.rotation);
  const zIndex = numberValue(value.zIndex);

  if (
    !id ||
    !assetId ||
    !userId ||
    !pageType ||
    !pageId ||
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
    assetId,
    userId,
    pageType,
    pageId,
    x,
    y,
    scale,
    rotation,
    zIndex,
    opacity: numberValue(value.opacity) ?? undefined,
    widgetState: widgetStateValue(value.widgetState ?? value.builtInState),
  };
}

function widgetStateValue(value: unknown): WidgetPlacementState | undefined {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  if (value.variant === "calendar") {
    return {
      variant: "calendar",
      date: stringValue(value.date) ?? undefined,
    };
  }

  if (
    value.variant === "polaroidFrame" ||
    value.variant === "polaroidFramePortrait"
  ) {
    return {
      variant: value.variant,
      selectedImageId: stringValue(value.selectedImageId) ?? undefined,
    };
  }

  if (value.variant === "speechBubble") {
    return {
      variant: "speechBubble",
      text: stringValue(value.text) ?? undefined,
    };
  }

  return undefined;
}

function pageTypeValue(value: unknown): StickerPlacementPageType | null {
  if (value === "calendar" || value === "calendarRecap") {
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
