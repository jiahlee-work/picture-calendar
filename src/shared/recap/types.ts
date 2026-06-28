export type MonthlyRecapSelectionStatus = "not_started" | "prompted" | "selected" | "skipped";
export type MonthlyRecapTemplateId = "message" | "calendar_collage";

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
  saveSelection: (selection: MonthlyRecapSelectionDraft) => Promise<MonthlyRecap>;
  skipSelection: (userId: string, month: string) => Promise<MonthlyRecap>;
};

export type MonthlyRecapMetadataStore = {
  load: () => Promise<MonthlyRecap[]>;
  save: (recaps: MonthlyRecap[]) => Promise<void>;
};
