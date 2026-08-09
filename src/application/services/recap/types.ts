export type {
  MonthlyRecapCanvas,
  MonthlyRecapCanvasDraft,
  MonthlyRecapCanvasMetadataStore,
  MonthlyRecapCanvasRepository,
} from "@/shared/recap/types";

export type RecapExportRequest = {
  userId: string;
  month: string;
  format: "calendar";
};
