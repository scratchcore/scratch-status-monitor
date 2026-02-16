import { defineConfig, presetWind3, transformerDirectives } from "unocss";

export default defineConfig({
  transformers: [transformerDirectives()],
  presets: [presetWind3()],
});
