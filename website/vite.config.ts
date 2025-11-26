import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";
import ssrPlugin from "vite-ssr-components/plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tsconfigPaths(), cloudflare(), ssrPlugin(), react()],
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "http://127.0.0.1:8787",
  //       changeOrigin: true,
  //     },
  //   },
  // },
});
