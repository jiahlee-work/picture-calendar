export const MonthlyRecapSelectionStatus = {
  notStarted: "not_started",
  prompted: "prompted",
  selected: "selected",
  skipped: "skipped",
} as const;

export type MonthlyRecapSelectionStatus =
  (typeof MonthlyRecapSelectionStatus)[keyof typeof MonthlyRecapSelectionStatus];

export const MonthlyRecapTemplateId = {
  calendarCollage: "calendar_collage",
  message: "message",
} as const;

export type MonthlyRecapTemplateId =
  (typeof MonthlyRecapTemplateId)[keyof typeof MonthlyRecapTemplateId];

export type MonthlyRecap = {
  id: string;
  userId: string;
  month: string;
  selectedPhotoIds: string[];
  templateId: MonthlyRecapTemplateId;
  calendarPhotoIds: string[];
  backgroundPhotoIds: string[];
  selectionStatus: MonthlyRecapSelectionStatus;
  promptedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const RecapCanvasLayoutId = {
  fourGrid: "four_grid",
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
  photoId: string;
  type: "photo";
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
    });

export type RecapCanvasElement =
  | RecapCanvasPhotoElement
  | RecapCanvasStickerElement
  | RecapCanvasTextElement
  | RecapCanvasWidgetElement;

export type MonthlyRecapCanvas = {
  createdAt: string;
  elements: RecapCanvasElement[];
  id: string;
  layout: RecapCanvasLayoutState | null;
  month: string;
  updatedAt: string;
  userId: string;
};

export type MonthlyRecapCanvasDraft = {
  elements: RecapCanvasElement[];
  layout: RecapCanvasLayoutState | null;
  month: string;
  userId: string;
};

export type MonthlyRecapSelectionDraft = {
  userId: string;
  month: string;
  selectedPhotoIds: string[];
  templateId?: MonthlyRecapTemplateId;
  calendarPhotoIds?: string[];
  backgroundPhotoIds?: string[];
};

export type MonthlyRecapRepository = {
  getByMonth: (userId: string, month: string) => Promise<MonthlyRecap | null>;
  listByYear: (userId: string, year: string) => Promise<MonthlyRecap[]>;
  markPrompted: (userId: string, month: string) => Promise<MonthlyRecap>;
  saveSelection: (
    selection: MonthlyRecapSelectionDraft,
  ) => Promise<MonthlyRecap>;
  skipSelection: (userId: string, month: string) => Promise<MonthlyRecap>;
};

export type MonthlyRecapMetadataStore = {
  load: () => Promise<MonthlyRecap[]>;
  save: (recaps: MonthlyRecap[]) => Promise<void>;
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
