import { describe, expect, it } from "vitest";

import {
  createRecapCanvasLayoutDraft,
  getRecapCanvasLayoutDraftSlotPhotoIds,
  isRecapCanvasLayoutDraftComplete,
  selectRecapCanvasLayoutDraft,
  toRecapCanvasLayoutState,
  updateRecapCanvasLayoutDraftSlot,
} from "@/application/services/recap/recap-canvas-layout-draft";
import { RecapCanvasLayoutId } from "@/shared/recap/types";

describe("recap canvas layout draft", () => {
  it("restores committed photos after visiting and editing another layout", () => {
    const committedLayout = {
      layoutId: RecapCanvasLayoutId.twoColumns,
      slotPhotoIds: {
        left: "photo-left",
        right: "photo-right",
      },
    };
    const initialDraft = createRecapCanvasLayoutDraft(
      committedLayout,
      RecapCanvasLayoutId.twoColumns,
    );
    const otherLayoutDraft = updateRecapCanvasLayoutDraftSlot(
      selectRecapCanvasLayoutDraft(initialDraft, RecapCanvasLayoutId.onePhoto),
      "photo",
      "photo-cover",
    );
    const restoredDraft = selectRecapCanvasLayoutDraft(
      otherLayoutDraft,
      RecapCanvasLayoutId.twoColumns,
    );

    expect(getRecapCanvasLayoutDraftSlotPhotoIds(restoredDraft)).toEqual({
      left: "photo-left",
      right: "photo-right",
    });
  });

  it("preserves independent photo selections for each visited layout", () => {
    const initialDraft = createRecapCanvasLayoutDraft(
      null,
      RecapCanvasLayoutId.twoColumns,
    );
    const columnsDraft = updateRecapCanvasLayoutDraftSlot(
      initialDraft,
      "left",
      "photo-left",
    );
    const coverDraft = updateRecapCanvasLayoutDraftSlot(
      selectRecapCanvasLayoutDraft(columnsDraft, RecapCanvasLayoutId.onePhoto),
      "photo",
      "photo-cover",
    );

    expect(
      getRecapCanvasLayoutDraftSlotPhotoIds(
        selectRecapCanvasLayoutDraft(
          coverDraft,
          RecapCanvasLayoutId.twoColumns,
        ),
      ),
    ).toEqual({ left: "photo-left", right: null });
    expect(getRecapCanvasLayoutDraftSlotPhotoIds(coverDraft)).toEqual({
      photo: "photo-cover",
    });
  });

  it("ignores a stale slot from a previously selected layout", () => {
    const draft = selectRecapCanvasLayoutDraft(
      createRecapCanvasLayoutDraft(null, RecapCanvasLayoutId.twoColumns),
      RecapCanvasLayoutId.onePhoto,
    );

    expect(
      updateRecapCanvasLayoutDraftSlot(draft, "left", "photo-left"),
    ).toEqual(draft);
  });

  it("treats no layout as complete and commits it as null", () => {
    const draft = selectRecapCanvasLayoutDraft(
      createRecapCanvasLayoutDraft(null, RecapCanvasLayoutId.twoColumns),
      null,
    );

    expect(isRecapCanvasLayoutDraftComplete(draft)).toBe(true);
    expect(toRecapCanvasLayoutState(draft)).toBeNull();
  });

  it("commits a complete selected layout", () => {
    const initialDraft = createRecapCanvasLayoutDraft(
      null,
      RecapCanvasLayoutId.twoColumns,
    );
    const leftSelected = updateRecapCanvasLayoutDraftSlot(
      initialDraft,
      "left",
      "photo-left",
    );
    const completeDraft = updateRecapCanvasLayoutDraftSlot(
      leftSelected,
      "right",
      "photo-right",
    );

    expect(isRecapCanvasLayoutDraftComplete(completeDraft)).toBe(true);
    expect(toRecapCanvasLayoutState(completeDraft)).toEqual({
      layoutId: RecapCanvasLayoutId.twoColumns,
      slotPhotoIds: {
        left: "photo-left",
        right: "photo-right",
      },
    });
  });
});
