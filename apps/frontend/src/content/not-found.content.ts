import { type Dictionary, t } from "intlayer";

const notFoundContent = {
  key: "not-found",
  content: {
    backHome: t({
      ja: "ホームに戻る",
      en: "Back to Home",
      de: "Zurück zur Startseite",
      fr: "Retour à l'accueil",
    }),
    lostMessage: t({
      ja: "まるで虚無に迷い込んだかのよう...",
      en: "Looks like you've wandered into the void...",
      de: "Es sieht so aus, als hätten Sie sich in die Leere verirrt...",
      fr: "On dirait que vous vous êtes aventuré dans le vide...",
    }),
    subtitle: t({
      ja: "おっと！お探しのページは存在しません。",
      en: "Oops! The page you're looking for doesn't exist.",
      de: "Hoppla! Die Seite, die Sie suchen, existiert nicht.",
      fr: "Oups! La page que vous recherchez n'existe pas.",
    }),
    title: t({
      ja: "ページが見つかりません",
      en: "Page Not Found",
      de: "Seite nicht gefunden",
      fr: "Page non trouvée",
    }),
  },
} satisfies Dictionary;

export default notFoundContent;
