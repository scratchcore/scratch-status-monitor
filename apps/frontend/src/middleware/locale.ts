import { logger } from "@scracc/tanstack-plugin-logger";
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

  logger(
    {
      level: "info",
      name: "localeMiddleware",
    },
    "Request received:",
    pathname
  );

  const skipPaths = ["/s", "/api"];
  if (skipPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    logger(
      {
        level: "info",
        name: "localeMiddleware",
      },
      "Skipping locale middleware for path:",
      pathname
    );
    return next();
  }

  // パスから locale を抽出 (例: /fr/page → fr, /ja/page → ja)
  const pathSegments = pathname.split("/").filter(Boolean);
  const locale = pathSegments[0];

  logger(
    {
      level: "info",
      name: "localeMiddleware",
    },
    "Extracted locale:",
    locale || "(none)"
  );

  // locale がある場合は検証
  if (locale) {
    const { isValid } = validatePrefix(locale, { mode: "prefix-all" });

    logger(
      {
        level: "info",
        name: "localeMiddleware",
      },
      "Locale validation result:",
      { locale, isValid }
    );

    // 無効な locale の場合は優先言語を取得してリダイレクト
    if (!isValid) {
      // パスを保持して、優先言語を先頭に付ける
      const preferredLocale = await getPreferredLocale();
      const redirectPath = `/${preferredLocale}${pathname}`;

      logger(
        {
          level: "info",
          name: "localeMiddleware",
        },
        "Invalid locale detected, redirecting:",
        JSON.stringify({
          from: pathname,
          to: redirectPath,
          preferredLocale,
        })
      );

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

    logger(
      {
        level: "info",
        name: "localeMiddleware",
      },
      "No locale in path, redirecting to preferred locale:",
      JSON.stringify({
        from: pathname,
        to: redirectPath,
        preferredLocale,
      })
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectPath,
      },
    });
  }

  // 検証成功時は次のミドルウェアに進む
  logger(
    {
      level: "info",
      name: "localeMiddleware",
    },
    `Validation successful, proceeding to next middleware: ${locale}`
  );
  return next();
});
