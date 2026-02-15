import { createMiddleware } from "@tanstack/react-start";
import { validatePrefix } from "intlayer";
import { getPreferredLocale } from "@/lib/i18n/get-preferred-locale";

/**
 * グローバルミドルウェア: 言語検証とリダイレクト処理
 *
 * 1. locale パラメータが存在する場合：検証し、無効なら defaultLocale へリダイレクト
 * 2. locale パラメータが存在しない場合（`/` など）：
 *    ユーザーの優先言語を取得して、`/<locale>` へリダイレクト
 */
export const localeMiddleware = createMiddleware().server(async ({ next, request }) => {
  // リクエスト URL からパスを解析
  const url = new URL(request.url);
  const pathname = url.pathname;

  console.log("[localeMiddleware] リクエストパス:", pathname);

  if (pathname === "/s" || pathname.startsWith("/s/")) {
    console.log("[localeMiddleware] /s ルートは処理対象外");
    return next();
  }

  // パスから locale を抽出 (例: /fr/page → fr, /ja/page → ja)
  const pathSegments = pathname.split("/").filter(Boolean);
  const locale = pathSegments[0];

  console.log("[localeMiddleware] 抽出された locale:", locale || "(なし)");

  // locale がある場合は検証
  if (locale) {
    const { isValid } = validatePrefix(locale, { mode: "prefix-all" });

    console.log("[localeMiddleware] locale 検証結果:", { locale, isValid });

    // 無効な locale の場合は優先言語を取得してリダイレクト
    if (!isValid) {
      // パスを保持して、優先言語を先頭に付ける
      const preferredLocale = await getPreferredLocale();
      const redirectPath = `/${preferredLocale}${pathname}`;

      console.log("[localeMiddleware] 無効な locale からリダイレクト:", {
        from: pathname,
        to: redirectPath,
        preferredLocale,
      });

      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectPath,
        },
      });
    }
  } else {
    // locale がない場合（`/` など）は優先言語を取得
    const preferredLocale = await getPreferredLocale();
    const redirectPath =
      pathname === "/" ? `/${preferredLocale}` : `/${preferredLocale}${pathname}`;

    console.log("[localeMiddleware] locale がないパスからリダイレクト:", {
      from: pathname,
      to: redirectPath,
      preferredLocale,
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectPath,
      },
    });
  }

  // 検証成功時は次のミドルウェアに進む
  console.log("[localeMiddleware] 検証成功、次のミドルウェアに進む:", { locale });
  return next();
});
