import { t, type Dictionary } from "intlayer";

const appContent = {
  key: "app",
  content: {
    navigation: t({
      ja: "ナビゲーション",
      en: "Navigation",
    }),
    home: t({
      ja: "ホーム",
      en: "Home",
    }),
  },
} satisfies Dictionary;

export default appContent;
