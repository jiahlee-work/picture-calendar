import type {
  RecapCanvasElement,
  RecapCanvasPhotoElement,
  RecapCanvasStickerElement,
  RecapCanvasTextElement,
  RecapCanvasWidgetElement,
} from "@/shared/recap/types";
import type { WidgetVariant } from "@/application/services/stickers/types";

export type CreateRecapTextElementOptions = {
  id: string;
  x: number;
  y: number;
  zIndex: number;
};

export type CreateRecapStickerElementOptions = {
  id: string;
  stickerAssetId: string;
  x: number;
  y: number;
  zIndex: number;
};

export type CreateRecapPhotoElementOptions = {
  height?: number;
  id: string;
  photoId: string;
  width?: number;
  x: number;
  y: number;
  zIndex: number;
};

export type CreateRecapWidgetElementOptions = {
  id: string;
  photoId?: string;
  text?: string;
  variant: WidgetVariant;
  x: number;
  y: number;
  zIndex: number;
};

export type RecapCanvasTextElementUpdate = Partial<
  Omit<RecapCanvasTextElement, "id" | "type">
>;

export type RecapCanvasElementLayerDirection = "backward" | "forward";

export const DEFAULT_RECAP_TEXT_CONTENT = "텍스트를 입력하려면 두 번 탭하세요.";
export const DEFAULT_RECAP_TEXT_WIDTH = 340;
export const DEFAULT_RECAP_WIDGET_SPEECH_BUBBLE_TEXT = "텍스트 입력";
export const DEFAULT_RECAP_PHOTO_ELEMENT_MAX_SIZE = 164;

export function getRecapPhotoElementSize(
  sourceWidth: number,
  sourceHeight: number,
  maxSize = DEFAULT_RECAP_PHOTO_ELEMENT_MAX_SIZE,
): { height: number; width: number } {
  if (
    !Number.isFinite(sourceWidth) ||
    !Number.isFinite(sourceHeight) ||
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    maxSize <= 0
  ) {
    return { height: maxSize, width: maxSize };
  }

  const scale = maxSize / Math.max(sourceWidth, sourceHeight);

  return {
    height: roundToThreeDecimals(sourceHeight * scale),
    width: roundToThreeDecimals(sourceWidth * scale),
  };
}

function roundToThreeDecimals(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function createRecapTextElement(
  options: CreateRecapTextElementOptions,
): RecapCanvasTextElement {
  const { id, x, y, zIndex } = options;

  return {
    id,
    color: "#121212",
    content: DEFAULT_RECAP_TEXT_CONTENT,
    fontSize: 24,
    fontStyle: "normal",
    fontWeight: "normal",
    rotation: 0,
    scale: 1,
    textAlign: "left",
    textDecorationLine: "none",
    type: "text",
    width: DEFAULT_RECAP_TEXT_WIDTH,
    x,
    y,
    zIndex,
  };
}

export function createRecapStickerElement(
  options: CreateRecapStickerElementOptions,
): RecapCanvasStickerElement {
  const { id, stickerAssetId, x, y, zIndex } = options;

  return {
    id,
    rotation: 0,
    scale: 1,
    stickerAssetId,
    type: "sticker",
    x,
    y,
    zIndex,
  };
}

export function createRecapPhotoElement(
  options: CreateRecapPhotoElementOptions,
): RecapCanvasPhotoElement {
  return {
    height: options.height,
    id: options.id,
    photoId: options.photoId,
    rotation: 0,
    scale: 1,
    type: "photo",
    width: options.width,
    x: options.x,
    y: options.y,
    zIndex: options.zIndex,
  };
}

export function createRecapWidgetElement(
  options: CreateRecapWidgetElementOptions,
): RecapCanvasWidgetElement {
  const { id, photoId, text, variant, x, y, zIndex } = options;
  const base = {
    id,
    rotation: 0,
    scale: 1,
    type: "widget" as const,
    x,
    y,
    zIndex,
  };

  if (variant === "calendar") {
    return {
      ...base,
      variant,
    };
  }

  if (variant === "speechBubble") {
    return {
      ...base,
      text: text ?? DEFAULT_RECAP_WIDGET_SPEECH_BUBBLE_TEXT,
      variant,
    };
  }

  return {
    ...base,
    photoId,
    variant,
  };
}

export function upsertRecapCanvasElement(
  elements: RecapCanvasElement[],
  element: RecapCanvasElement,
): RecapCanvasElement[] {
  const elementsById = new Map<string, RecapCanvasElement>();

  for (const currentElement of elements) {
    elementsById.set(
      currentElement.id,
      cloneRecapCanvasElement(currentElement),
    );
  }

  elementsById.set(element.id, cloneRecapCanvasElement(element));

  return sortRecapCanvasElements(Array.from(elementsById.values()));
}

export function updateRecapCanvasTextElement(
  elements: RecapCanvasElement[],
  elementId: string,
  update: RecapCanvasTextElementUpdate,
): RecapCanvasElement[] {
  return sortRecapCanvasElements(
    elements.map((element) => {
      if (element.id !== elementId || element.type !== "text") {
        return cloneRecapCanvasElement(element);
      }

      return {
        ...element,
        ...update,
        id: element.id,
        type: "text",
      };
    }),
  );
}

export function deleteRecapCanvasElement(
  elements: RecapCanvasElement[],
  elementId: string,
): RecapCanvasElement[] {
  return sortRecapCanvasElements(
    elements
      .filter((element) => element.id !== elementId)
      .map(cloneRecapCanvasElement),
  );
}

export function moveRecapCanvasElement(
  elements: RecapCanvasElement[],
  elementId: string,
  direction: RecapCanvasElementLayerDirection,
): RecapCanvasElement[] {
  const sortedElements = sortRecapCanvasElements(elements);
  const currentIndex = sortedElements.findIndex(
    (element) => element.id === elementId,
  );

  if (currentIndex < 0) {
    return sortedElements.map(cloneRecapCanvasElement);
  }

  const adjacentIndex =
    direction === "forward" ? currentIndex + 1 : currentIndex - 1;

  if (adjacentIndex < 0 || adjacentIndex >= sortedElements.length) {
    return sortedElements.map(cloneRecapCanvasElement);
  }

  const currentElement = sortedElements[currentIndex];
  const adjacentElement = sortedElements[adjacentIndex];
  const nextElements = sortedElements.map(cloneRecapCanvasElement);

  nextElements[currentIndex] = {
    ...currentElement,
    zIndex: adjacentElement.zIndex,
  };
  nextElements[adjacentIndex] = {
    ...adjacentElement,
    zIndex: currentElement.zIndex,
  };

  return sortRecapCanvasElements(nextElements);
}

export function getNextRecapCanvasElementZIndex(
  elements: RecapCanvasElement[],
): number {
  return elements.reduce(
    (nextZIndex, element) => Math.max(nextZIndex, element.zIndex + 1),
    1,
  );
}

export function sortRecapCanvasElements(
  elements: RecapCanvasElement[],
): RecapCanvasElement[] {
  return [...elements].sort((left, right) => {
    const zIndexOrder = left.zIndex - right.zIndex;

    return zIndexOrder === 0 ? left.id.localeCompare(right.id) : zIndexOrder;
  });
}

function cloneRecapCanvasElement(
  element: RecapCanvasElement,
): RecapCanvasElement {
  return { ...element };
}
