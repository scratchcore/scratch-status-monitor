import { getEnv } from "@/plugins/envrc";

export const getSiteUrl = (): string => {
  const env = getEnv();
  return env.VITE_SITE_BASE_URL.replace(/\/+$/, "");
};
