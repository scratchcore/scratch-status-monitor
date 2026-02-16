import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";

export default defineConfig({
  site: "https://scratchcore.github.io",
  base: "/scratch-status-monitor",
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
  ],
});
