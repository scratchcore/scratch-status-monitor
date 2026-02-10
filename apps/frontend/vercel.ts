import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  public: false,
  name: "ssm-frontend",
  framework: "tanstack-start",
  installCommand: "pnpm install",
  devCommand: "pnpm run dev",
  buildCommand: "pnpm run build",
  cleanUrls: true,
  trailingSlash: false,
};
