import { type Dictionary, t } from "intlayer";

const wordContent = {
  key: "word",
  content: {
    lastUpdated: t({
      ja: "最終更新",
      en: "Last Updated",
      de: "Zuletzt aktualisiert",
      fr: "Dernière mise à jour",
    }),
  },
} satisfies Dictionary;

export default wordContent;
