import { describe, expect, it } from "vitest";

import { createLocalMonthlyRecapCanvasRepository } from "@/infrastructure/persistence/recap/local-monthly-recap-canvas-repository";
import { RecapCanvasLayoutId } from "@/shared/recap/types";

describe("createLocalMonthlyRecapCanvasRepository", () => {
  it("saves and restores a monthly recap canvas by user and month", async () => {
    const repository = createLocalMonthlyRecapCanvasRepository({
      now: () => new Date("2026-08-07T00:00:00.000Z"),
    });

    await expect(repository.getByMonth("user-1", "2026-07")).resolves.toBe(
      null,
    );

    const savedCanvas = await repository.save({
      backgroundColor: "#FACC15",
      userId: "user-1",
      month: "2026-07",
      elements: [],
      layout: {
        layoutId: RecapCanvasLayoutId.twoRows,
        slotPhotoIds: {
          bottom: "photo-2",
          top: "photo-1",
        },
      },
    });

    expect(savedCanvas).toMatchObject({
      backgroundColor: "#FACC15",
      id: "local-recap-canvas-2026-07",
      userId: "user-1",
      month: "2026-07",
      layout: {
        layoutId: RecapCanvasLayoutId.twoRows,
        slotPhotoIds: {
          bottom: "photo-2",
          top: "photo-1",
        },
      },
    });
    await expect(repository.getByMonth("user-1", "2026-07")).resolves.toEqual(
      savedCanvas,
    );
  });

  it("updates an existing canvas without changing the created timestamp", async () => {
    const dates = [
      new Date("2026-08-07T00:00:00.000Z"),
      new Date("2026-08-08T00:00:00.000Z"),
    ];
    const repository = createLocalMonthlyRecapCanvasRepository({
      now: () => dates.shift() ?? new Date("2026-08-09T00:00:00.000Z"),
    });

    const firstCanvas = await repository.save({
      userId: "user-1",
      month: "2026-07",
      elements: [],
      layout: {
        layoutId: RecapCanvasLayoutId.twoColumns,
        slotPhotoIds: {
          left: "photo-1",
          right: "photo-2",
        },
      },
    });
    const updatedCanvas = await repository.save({
      userId: "user-1",
      month: "2026-07",
      elements: [],
      layout: {
        layoutId: RecapCanvasLayoutId.threeRows,
        slotPhotoIds: {
          bottom: "photo-3",
          middle: "photo-2",
          top: "photo-1",
        },
      },
    });

    expect(updatedCanvas.createdAt).toBe(firstCanvas.createdAt);
    expect(updatedCanvas.updatedAt).toBe("2026-08-08T00:00:00.000Z");
    expect(updatedCanvas.layout?.layoutId).toBe(RecapCanvasLayoutId.threeRows);
  });
});
