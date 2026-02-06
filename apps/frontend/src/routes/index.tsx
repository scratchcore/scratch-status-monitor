import { createFileRoute, redirect } from "@tanstack/react-router";
import { defaultLocale, locales, getBrowserLocale } from "intlayer";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // ユーザーの言語を検出（ブラウザ設定を優先）
    let userLocale = defaultLocale;

    try {
      const browserLocale = getBrowserLocale();
      // ブラウザの言語がサポート対象か確認
      if (browserLocale && locales.includes(browserLocale)) {
        userLocale = browserLocale;
      }
    } catch {
      // ブラウザ言語検出に失敗した場合はデフォルト言語を使用
      userLocale = defaultLocale;
    }

    // ユーザーの言語にリダイレクト
    throw redirect({
      to: "/$locale",
      params: { locale: userLocale },
    });
  },
});
