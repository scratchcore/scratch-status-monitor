import { t, type Dictionary } from "intlayer";

const wordContent = {
  key: "word",
  content: {
    lastUpdated: t({
      ja: "最終更新",
      en: "Last Updated",
    }),
  },
} satisfies Dictionary;

export default wordContent;
