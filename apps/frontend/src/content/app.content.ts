import { type Dictionary, t } from "intlayer";

const appContent = {
  key: "app",
  content: {
    navigation: t({
      ja: "ナビゲーション",
      en: "Navigation",
      de: "Navigation",
      fr: "Navigation",
    }),
    home: t({
      ja: "ホーム",
      en: "Home",
      de: "Startseite",
      fr: "Accueil",
    }),
  },
} satisfies Dictionary;

export default appContent;
