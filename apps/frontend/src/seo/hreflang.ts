import { getPrefix } from "intlayer";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/utils/locales";
import { getSiteUrl } from "@/utils/site";

type HreflangOptions = {
  locale: string;
  path: string;
  includeXDefault?: boolean;
};

type LinkEntry = {
  rel: string;
  href: string;
  hrefLang?: string;
};

const normalizePath = (value: string) => {
  if (value === "/") {
    return value;
  }

  return `/${value}`.replace(/\/+/g, "/").replace(/\/$/, "");
};

const buildLocalizedPath = (locale: string, path: string) => {
  const normalizedPath = normalizePath(path);
  const prefix = getPrefix(locale, { mode: "prefix-all" }).localePrefix;

  if (!prefix) {
    return normalizedPath;
  }

  return normalizePath(`${prefix}${normalizedPath === "/" ? "" : normalizedPath}`);
};

export const buildHreflangLinks = ({
  locale,
  path,
  includeXDefault = true,
}: HreflangOptions): LinkEntry[] => {
  const baseUrl = getSiteUrl();

  const localizedEntries = SUPPORTED_LOCALES.map((supportedLocale) => {
    const localizedPath = buildLocalizedPath(supportedLocale, path);
    return {
      locale: supportedLocale,
      href: new URL(localizedPath, `${baseUrl}/`).toString(),
    };
  });

  const canonicalEntry =
    localizedEntries.find((entry) => entry.locale === locale) ?? localizedEntries[0];

  const links: LinkEntry[] = [
    {
      rel: "canonical",
      href: canonicalEntry.href,
    },
    ...localizedEntries.map((entry) => ({
      rel: "alternate",
      hrefLang: entry.locale,
      href: entry.href,
    })),
  ];

  if (includeXDefault) {
    const defaultEntry =
      localizedEntries.find((entry) => entry.locale === DEFAULT_LOCALE) ?? localizedEntries[0];

    links.push({
      rel: "alternate",
      hrefLang: "x-default",
      href: defaultEntry.href,
    });
  }

  return links;
};
