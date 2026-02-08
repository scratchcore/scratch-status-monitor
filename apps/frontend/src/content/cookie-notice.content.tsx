import { html, t, type Dictionary } from "intlayer";

const cookieNoticeContent = {
  key: "cookie-notice",
  content: {
    msg: t({
      ja: html("当サイトではCookieを使用します。詳細は <a>Cookieポリシー</a> をご確認ください。"),
      en: html("This site uses cookies. Please see our <a>Cookie Policy</a> for more details."),
    }),
  },
} satisfies Dictionary;

export default cookieNoticeContent;
