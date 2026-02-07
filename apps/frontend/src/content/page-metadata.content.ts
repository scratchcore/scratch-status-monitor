import { t, type Dictionary } from "intlayer";

const pageMetadataContent = {
  key: "page-metadata",
  content: {
    about: t({
      ja: "Scratchステータスモニターについて",
      en: "About Scratch Status Monitor",
    }),
    team: {
      title: t({
        ja: "チーム・貢献者",
        en: "Team & Contributors",
      }),
    },
  },
} satisfies Dictionary;

export default pageMetadataContent;
