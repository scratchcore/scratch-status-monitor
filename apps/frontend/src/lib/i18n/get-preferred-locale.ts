import { defaultLocale, getBrowserLocale, getCookie, locales } from "intlayer";
import { getLocaleServer } from "./server";

/**
 * ロケール値がサポートされているか判定
 */
const isSupportedLocale = (value: string): value is (typeof locales)[number] =>
  locales.includes(value as (typeof locales)[number]);

/**
 * ユーザーの優先言語を検出してサポート言語として返す
 *
 * 優先順:
 * 1. Cookie（`INTLAYER_LOCALE`）
 * 2. ブラウザの言語設定（クライアント）
 * 3. サーバーの言語検出（SSR）
 * 4. デフォルト言語
 */
export async function getPreferredLocale(): Promise<(typeof locales)[number]> {
  // クライアント環境
  if (typeof document !== "undefined") {
    const cookieLocale = getCookie("INTLAYER_LOCALE", document.cookie ?? "");
    if (cookieLocale && isSupportedLocale(cookieLocale)) {
      return cookieLocale;
    }

    const browserLocale = getBrowserLocale();
    if (browserLocale && isSupportedLocale(browserLocale)) {
      return browserLocale;
    }
  } else {
    // サーバー環境（SSR）
    try {
      const serverLocale = await getLocaleServer();
      if (serverLocale && isSupportedLocale(serverLocale)) {
        return serverLocale;
      }
    } catch {
      // エラーの場合はデフォルトにフォールバック
    }
  }

  return defaultLocale;
}
