import type { ComponentProps } from "react";

import { sortRecapCanvasElements } from "@/application/services/recap/recap-canvas-elements";
import { RecapCanvasStickerLayer } from "@/presentation/components/organisms/recap-canvas-sticker-layer";
import { RecapCanvasTextLayer } from "@/presentation/components/organisms/recap-canvas-text-layer";

type StickerLayerProps = ComponentProps<typeof RecapCanvasStickerLayer>;
type TextLayerProps = ComponentProps<typeof RecapCanvasTextLayer>;

type RecapCanvasElementStackProps = {
  assets: StickerLayerProps["assets"];
  editingTextElementId: TextLayerProps["editingElementId"];
  editingWidgetElementId: StickerLayerProps["editingWidgetElementId"];
  elements: StickerLayerProps["elements"];
  monthKey: StickerLayerProps["monthKey"];
  photosById: StickerLayerProps["photosById"];
  selectedElementId: StickerLayerProps["selectedElementId"];
  onChangeElement: StickerLayerProps["onChangeElement"];
  onChangeTextElement: TextLayerProps["onChangeTextElement"];
  onEndTextEditing: TextLayerProps["onEndTextEditing"];
  onEndWidgetEditing: StickerLayerProps["onEndWidgetEditing"];
  onLongPressElement: StickerLayerProps["onLongPressElement"];
  onRequestPhotoSelection: StickerLayerProps["onRequestPhotoSelection"];
  onSelectElement: StickerLayerProps["onSelectElement"];
  onStartTextEditing: TextLayerProps["onStartTextEditing"];
  onStartWidgetEditing: StickerLayerProps["onStartWidgetEditing"];
};

export function RecapCanvasElementStack(props: RecapCanvasElementStackProps) {
  const {
    assets,
    editingTextElementId,
    editingWidgetElementId,
    elements,
    monthKey,
    onChangeElement,
    onChangeTextElement,
    onEndTextEditing,
    onEndWidgetEditing,
    onLongPressElement,
    onRequestPhotoSelection,
    onSelectElement,
    onStartTextEditing,
    onStartWidgetEditing,
    photosById,
    selectedElementId,
  } = props;
  const orderedElements = sortRecapCanvasElements(elements);

  return orderedElements.map((element) =>
    element.type === "text" ? (
      <RecapCanvasTextLayer
        key={element.id}
        editingElementId={editingTextElementId}
        elements={[element]}
        selectedElementId={selectedElementId}
        onChangeTextElement={onChangeTextElement}
        onEndTextEditing={onEndTextEditing}
        onSelectElement={onSelectElement}
        onStartTextEditing={onStartTextEditing}
      />
    ) : (
      <RecapCanvasStickerLayer
        key={element.id}
        assets={assets}
        editingWidgetElementId={editingWidgetElementId}
        elements={[element]}
        monthKey={monthKey}
        photosById={photosById}
        selectedElementId={selectedElementId}
        onChangeElement={onChangeElement}
        onEndWidgetEditing={onEndWidgetEditing}
        onLongPressElement={onLongPressElement}
        onRequestPhotoSelection={onRequestPhotoSelection}
        onSelectElement={onSelectElement}
        onStartWidgetEditing={onStartWidgetEditing}
      />
    ),
  );
}
