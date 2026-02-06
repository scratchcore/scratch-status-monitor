import { Locales, type IntlayerConfig } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    locales: [Locales.JAPANESE, Locales.ENGLISH],
    requiredLocales: [Locales.JAPANESE],
    defaultLocale: Locales.JAPANESE,
  },
  routing: {
    mode: "prefix-all",
  },
  content: {
    contentDir: ["./src/content"],
  },
};

export default config;
