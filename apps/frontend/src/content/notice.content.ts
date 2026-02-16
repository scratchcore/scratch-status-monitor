import { type Dictionary, t } from "intlayer";

const NoticeContent = {
  key: "notice",
  content: {
    isNotDefaultLocaleContent: t({
      ja: "このコンテンツは翻訳版です。原文と異なる場合があります。",
      en: "This content is translated and may differ from the original.",
      de: "Dieser Inhalt ist übersetzt und kann vom Original abweichen.",
      fr: "Ce contenu est traduit et peut différer de l'original.",
    }),
    isDefault: t({
      ja: "お使いの言語のコンテンツが利用できないため、デフォルト言語を表示しています。",
      en: "You are viewing the default language content because your preferred language is not available.",
      de: "Sie sehen den Standard-Sprachinhalt, da Ihre bevorzugte Sprache nicht verfügbar ist.",
      fr: "Vous consultez le contenu dans la langue par défaut car votre langue préférée n'est pas disponible.",
    }),
  },
} satisfies Dictionary;

export default NoticeContent;
