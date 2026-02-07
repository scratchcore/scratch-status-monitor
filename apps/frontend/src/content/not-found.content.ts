import { type Dictionary, t } from "intlayer";

const notFoundContent = {
  key: "not-found",
  content: {
    backHome: t({
      ja: "ホームに戻る",
      en: "Back to Home",
    }),
    lostMessage: t({
      ja: "まるで虚無に迷い込んだかのよう...",
      en: "Looks like you've wandered into the void...",
    }),
    subtitle: t({
      ja: "おっと！お探しのページは存在しません。",
      en: "Oops! The page you're looking for doesn't exist.",
    }),
    title: t({
      ja: "ページが見つかりません",
      en: "Page Not Found",
    }),
  },
} satisfies Dictionary;

export default notFoundContent;
