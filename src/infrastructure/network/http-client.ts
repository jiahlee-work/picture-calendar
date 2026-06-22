import { env } from "@/env/env";

export type HttpClient = {
  baseUrl: string;
};

export const httpClient: HttpClient = {
  baseUrl: env.apiBaseUrl,
};
