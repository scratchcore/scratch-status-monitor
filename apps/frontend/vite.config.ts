import { fileURLToPath, URL } from "node:url";
import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { intlayer } from "vite-intlayer";
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
    nitro(),
    viteReact(),
  ],
});

export default config;
