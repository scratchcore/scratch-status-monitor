import { useLocation, useNavigate } from "@tanstack/react-router";
import { getLocaleName, getPathWithoutLocale, getPrefix } from "intlayer";
import type { FC } from "react";
import { useLocale } from "react-intlayer";

import type { FileRouteTypes } from "@/routeTree.gen";

import { LOCALE_ROUTE } from "./LocalizedLink";

export const LocaleSwitcher: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { availableLocales, locale } = useLocale();

  const pathWithoutLocale = getPathWithoutLocale(pathname) || "/";
  const normalizedPath = pathWithoutLocale === "/" ? "" : pathWithoutLocale;

  const handleLocaleChange = (nextLocale: string) => {
    if (nextLocale === locale) {
      return;
    }

    const localizedTo =
      `/${LOCALE_ROUTE}${normalizedPath}` as FileRouteTypes["to"];
    const { localePrefix } = getPrefix(nextLocale);

    console.log("[LocaleSwitcher] 言語変更:", {
      from: locale,
      to: nextLocale,
      navigateTo: localizedTo,
      localePrefix,
    });

    void navigate({
      to: localizedTo,
      params: { locale: localePrefix },
    });
  };

  return (
    <div className="flex gap-2">
      {availableLocales.map((localeEl) => (
        <button
          key={localeEl}
          onClick={() => handleLocaleChange(localeEl)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            localeEl === locale
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          aria-current={localeEl === locale ? "page" : undefined}
        >
          {getLocaleName(localeEl)}
        </button>
      ))}
    </div>
  );
};
