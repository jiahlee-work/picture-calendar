import type { PublicEnv } from "@/env/env.schema";

const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? "local";

function isAppEnv(value: string): value is PublicEnv["appEnv"] {
  return ["local", "development", "staging", "production"].includes(value);
}

export const env: PublicEnv = {
  appEnv: isAppEnv(appEnv) ? appEnv : "local",
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
};
