import type { IntlayerConfig } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    defaultLocale: "ja",
    locales: ["ja", "en"],
  },
  content: {
    contentDir: ["./src/content"],
  },
};

export default config;
