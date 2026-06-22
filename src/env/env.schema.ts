export type AppEnv = "local" | "development" | "staging" | "production";

export type PublicEnv = {
  appEnv: AppEnv;
  apiBaseUrl: string;
};
