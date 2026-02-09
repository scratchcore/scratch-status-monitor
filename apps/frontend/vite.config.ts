import { fileURLToPath, URL } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { intlayer } from "vite-intlayer";
// plugins
import tsConfigPaths from "vite-tsconfig-paths";
import { envCheckPlugin } from "./src/plugins/envrc/vite-plugin";
import { sitemapPlugin } from "./src/plugins/sitemap/vite-plugin";

const config = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    envCheckPlugin(), // 環境変数チェックを最初に実行
    cloudflare({
      viteEnvironment: { name: "ssr" },
      configPath: "./wrangler.jsonc",
    }),
    intlayer(),
    contentCollections(),
    tailwindcss(),
    devtools(),
    tanstackStart({
      router: {
        routeFileIgnorePattern: ".content.(ts|tsx|js|mjs|cjs|jsx|json|jsonc|json5)$",
      },
    }),
    sitemapPlugin(),
    viteReact(),
  ],
});

export default config;
