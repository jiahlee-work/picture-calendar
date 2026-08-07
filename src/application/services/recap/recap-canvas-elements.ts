import type {
  RecapCanvasElement,
  RecapCanvasTextElement,
} from "@/shared/recap/types";

export type CreateRecapTextElementOptions = {
  id: string;
  x: number;
  y: number;
  zIndex: number;
};

export type RecapCanvasTextElementUpdate = Partial<
  Omit<RecapCanvasTextElement, "id" | "type">
>;

export const DEFAULT_RECAP_TEXT_CONTENT = "텍스트를 입력하려면 두 번 탭하세요.";

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
    x,
    y,
    zIndex,
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
