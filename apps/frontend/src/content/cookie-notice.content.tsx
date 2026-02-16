import { type Dictionary, html, t } from "intlayer";

const cookieNoticeContent = {
  key: "cookie-notice",
  content: {
    msg: t({
      ja: html("当サイトではCookieを使用します。詳細は <a>Cookieポリシー</a> をご確認ください。"),
      en: html("This site uses cookies. Please see our <a>Cookie Policy</a> for more details."),
      de: html(
        "Diese Seite verwendet Cookies. Bitte lesen Sie unsere <a>Cookie-Richtlinie</a> für weitere Details."
      ),
      fr: html(
        "Ce site utilise des cookies. Veuillez consulter notre <a>Politique de cookies</a> pour plus de détails."
      ),
    }),
  },
} satisfies Dictionary;

export default cookieNoticeContent;
