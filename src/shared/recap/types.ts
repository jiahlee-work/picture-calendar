export const RecapCanvasLayoutId = {
  fourGrid: "four_grid",
  onePhoto: "one_photo",
  threeRows: "three_rows",
  twoColumns: "two_columns",
  twoRows: "two_rows",
} as const;

export type RecapCanvasLayoutId =
  (typeof RecapCanvasLayoutId)[keyof typeof RecapCanvasLayoutId];

export type RecapCanvasLayoutState = {
  layoutId: RecapCanvasLayoutId;
  slotPhotoIds: Record<string, string | null>;
};

export type RecapCanvasElementType = "photo" | "sticker" | "text" | "widget";

export type RecapCanvasBaseElement = {
  id: string;
  opacity?: number;
  rotation: number;
  scale: number;
  type: RecapCanvasElementType;
  x: number;
  y: number;
  zIndex: number;
};

export type RecapCanvasPhotoElement = RecapCanvasBaseElement & {
  height?: number;
  photoId: string;
  type: "photo";
  width?: number;
};

export type RecapCanvasStickerElement = RecapCanvasBaseElement & {
  stickerAssetId: string;
  type: "sticker";
};

export type RecapCanvasTextElement = RecapCanvasBaseElement & {
  color: string;
  content: string;
  fontFamily?: string;
  fontSize: number;
  fontStyle?: "italic" | "normal";
  fontWeight?: "bold" | "normal";
  textAlign?: "center" | "left" | "right";
  textDecorationLine?: "none" | "underline";
  type: "text";
  width?: number;
};

export type RecapCanvasWidgetElement =
  | (RecapCanvasBaseElement & {
      type: "widget";
      variant: "calendar";
    })
  | (RecapCanvasBaseElement & {
      text: string;
      type: "widget";
      variant: "speechBubble";
    })
  | (RecapCanvasBaseElement & {
      photoId?: string;
      type: "widget";
      variant: "polaroidFrame";
    })
  | (RecapCanvasBaseElement & {
      photoId?: string;
      type: "widget";
      variant: "polaroidFramePortrait";
    });

export type RecapCanvasElement =
  | RecapCanvasPhotoElement
  | RecapCanvasStickerElement
  | RecapCanvasTextElement
  | RecapCanvasWidgetElement;

export type MonthlyRecapCanvas = {
  backgroundColor?: string;
  createdAt: string;
  elements: RecapCanvasElement[];
  id: string;
  layout: RecapCanvasLayoutState | null;
  month: string;
  updatedAt: string;
  userId: string;
};

export type MonthlyRecapCanvasDraft = {
  backgroundColor?: string;
  elements: RecapCanvasElement[];
  layout: RecapCanvasLayoutState | null;
  month: string;
  userId: string;
};

export type MonthlyRecapCanvasRepository = {
  getByMonth: (
    userId: string,
    month: string,
  ) => Promise<MonthlyRecapCanvas | null>;
  save: (draft: MonthlyRecapCanvasDraft) => Promise<MonthlyRecapCanvas>;
};

export type MonthlyRecapCanvasMetadataStore = {
  load: () => Promise<MonthlyRecapCanvas[]>;
  save: (canvases: MonthlyRecapCanvas[]) => Promise<void>;
};
