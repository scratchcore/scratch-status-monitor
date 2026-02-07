import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

// plugins
import tsConfigPaths from "vite-tsconfig-paths";
import { envCheckPlugin } from "./src/plugins/envrc/vite-plugin";
import { cloudflare } from "@cloudflare/vite-plugin";
import { intlayer, intlayerProxy } from "vite-intlayer";
import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

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
    intlayerProxy({}, { ignore: (req) => req.url?.startsWith("/wp-content") }),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    intlayer(),
    contentCollections(),
    tailwindcss(),
    devtools(),
    tanstackStart({
      router: {
        routeFileIgnorePattern:
          ".content.(ts|tsx|js|mjs|cjs|jsx|json|jsonc|json5)$",
      },
    }),
    viteReact(),
  ],
});

export default config;
