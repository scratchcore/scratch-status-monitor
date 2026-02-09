import { createFileRoute, redirect } from "@tanstack/react-router";
import { defaultLocale, getBrowserLocale, getCookie, locales } from "intlayer";
import { getLocaleServer } from "@/lib/i18n/server";

const isSupportedLocale = (value: string): value is (typeof locales)[number] =>
  locales.includes(value as (typeof locales)[number]);

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    // Prefer cookie -> browser locale (client) or server-side detection (SSR)
    let userLocale = defaultLocale;

    if (typeof document !== "undefined") {
      const cookieLocale = getCookie("INTLAYER_LOCALE", document.cookie ?? "");

      if (cookieLocale && isSupportedLocale(cookieLocale)) {
        userLocale = cookieLocale;
      } else {
        const browserLocale = getBrowserLocale();

        if (browserLocale && isSupportedLocale(browserLocale)) {
          userLocale = browserLocale;
        }
      }
    } else {
      try {
        const serverLocale = await getLocaleServer();

        if (serverLocale && isSupportedLocale(serverLocale)) {
          userLocale = serverLocale;
        }
      } catch {
        userLocale = defaultLocale;
      }
    }

    throw redirect({
      to: "/$locale",
      params: { locale: userLocale },
    });
  },
});
