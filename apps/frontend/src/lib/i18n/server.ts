import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { getCookie, getLocale } from "intlayer";

export const getLocaleServer = createServerFn().handler(async () => {
  const locale = await getLocale({
    // リクエストからクッキーを取得（デフォルト：'INTLAYER_LOCALE'）
    getCookie: (name) => {
      const cookieString = getRequestHeader("cookie");

      return getCookie(name, cookieString);
    },
    // リクエストからヘッダーを取得（デフォルト：'x-intlayer-locale'）
    // Accept-Languageネゴシエーションを使用したフォールバック
    getHeader: (name) => getRequestHeader(name),
  });

  return locale;
});
