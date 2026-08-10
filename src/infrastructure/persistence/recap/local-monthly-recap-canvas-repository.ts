import type {
  MonthlyRecapCanvas,
  MonthlyRecapCanvasDraft,
  MonthlyRecapCanvasMetadataStore,
  MonthlyRecapCanvasRepository,
} from "@/shared/recap/types";
import { dayjs } from "@/shared/date/dayjs";

type LocalMonthlyRecapCanvasRepositoryOptions = {
  initialCanvases?: MonthlyRecapCanvas[];
  metadataStore?: MonthlyRecapCanvasMetadataStore;
  now?: () => Date;
};

export function createLocalMonthlyRecapCanvasRepository(
  options: LocalMonthlyRecapCanvasRepositoryOptions | MonthlyRecapCanvas[] = [],
): MonthlyRecapCanvasRepository {
  const normalizedOptions = Array.isArray(options)
    ? { initialCanvases: options }
    : options;
  const metadataStore =
    normalizedOptions.metadataStore ??
    createMemoryMonthlyRecapCanvasMetadataStore(
      normalizedOptions.initialCanvases ?? [],
    );
  const now = normalizedOptions.now ?? (() => dayjs().toDate());

  return {
    async getByMonth(userId, month) {
      const canvasesByUserMonth = await loadCanvasesByUserMonth(metadataStore);

      return (
        canvasesByUserMonth.get(toMonthlyRecapCanvasKey(userId, month)) ?? null
      );
    },
    async save(draft) {
      const canvasesByUserMonth = await loadCanvasesByUserMonth(metadataStore);
      const canvasKey = toMonthlyRecapCanvasKey(draft.userId, draft.month);
      const existing = canvasesByUserMonth.get(canvasKey);
      const timestamp = now().toISOString();
      const nextCanvas = createMonthlyRecapCanvas(draft, existing, timestamp);

      canvasesByUserMonth.set(canvasKey, nextCanvas);
      await metadataStore.save(Array.from(canvasesByUserMonth.values()));

      return nextCanvas;
    },
  };
}

function createMemoryMonthlyRecapCanvasMetadataStore(
  initialCanvases: MonthlyRecapCanvas[],
): MonthlyRecapCanvasMetadataStore {
  let canvases = [...initialCanvases];

  return {
    async load() {
      return canvases;
    },
    async save(nextCanvases) {
      canvases = [...nextCanvases];
    },
  };
}

async function loadCanvasesByUserMonth(
  metadataStore: MonthlyRecapCanvasMetadataStore,
): Promise<Map<string, MonthlyRecapCanvas>> {
  const canvases = await metadataStore.load();

  return new Map(
    canvases.map((canvas) => [
      toMonthlyRecapCanvasKey(canvas.userId, canvas.month),
      canvas,
    ]),
  );
}

function createMonthlyRecapCanvas(
  draft: MonthlyRecapCanvasDraft,
  existing: MonthlyRecapCanvas | undefined,
  now: string,
): MonthlyRecapCanvas {
  return {
    backgroundColor: draft.backgroundColor,
    id: existing?.id ?? `local-recap-canvas-${draft.month}`,
    userId: draft.userId,
    month: draft.month,
    layout: draft.layout,
    elements: draft.elements,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function toMonthlyRecapCanvasKey(userId: string, month: string): string {
  return `${userId}:${month}`;
}
