export type {
  MonthlyRecap,
  MonthlyRecapMetadataStore,
  MonthlyRecapRepository,
  MonthlyRecapSelectionDraft,
  MonthlyRecapSelectionStatus,
  MonthlyRecapTemplateId,
} from "@/shared/recap/types";

export type RecapExportRequest = {
  userId: string;
  month: string;
  format: "calendar";
};
