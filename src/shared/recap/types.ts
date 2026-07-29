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
