import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";

export default defineConfig({
  site: "https://transparency.ssm.scra.cc",
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
  ],
});
