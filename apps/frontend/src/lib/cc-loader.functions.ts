import { allContents, allPolicies } from "content-collections";
import { configuration } from "intlayer";

export function getContent(locale: string, dir: string) {
  const {
    internationalization: { defaultLocale },
  } = configuration;

  const hasDefaultLocaleContent = allContents.find((item) => {
    return item._meta.fileName === `${defaultLocale}.mdx` && item._meta.directory === dir;
  });

  if (!hasDefaultLocaleContent) {
    return null;
  }

  const matchedContent = allContents.find((item) => {
    return item._meta.fileName === `${locale}.mdx` && item._meta.directory === dir;
  });

  return {
    isDefault: !matchedContent,
    res: matchedContent ?? hasDefaultLocaleContent,
  };
}

export function getAllPolicy(locale: string) {
  const {
    internationalization: { defaultLocale },
  } = configuration;

  // デフォルト言語のコンテンツ
  const defaultContents = allPolicies
    .map((item) => {
      return item._meta.fileName === `${defaultLocale}.md` && item;
    })
    .filter((item) => item !== false);

  // 指定された言語のコンテンツ
  const localeContents = allPolicies
    .map((item) => {
      return item._meta.fileName === `${locale}.md` && item;
    })
    .filter((item) => item !== false);

  // デフォルト言語のコンテンツをベースに、指定された言語のコンテンツがあればそれを優先して返す
  const mergedContents = defaultContents.map((defaultContent) => {
    const matchedLocaleContent = localeContents.find(
      (localeContent) => localeContent._meta.directory === defaultContent._meta.directory
    );
    return {
      isDefault: !matchedLocaleContent,
      res: matchedLocaleContent ?? defaultContent,
    };
  });

  return mergedContents;
}

export function getPolicy(locale: string, dir: string) {
  const {
    internationalization: { defaultLocale },
  } = configuration;

  const hasDefaultLocaleContent = allPolicies.find((item) => {
    return item._meta.fileName === `${defaultLocale}.md` && item._meta.directory === dir;
  });

  if (!hasDefaultLocaleContent) {
    return null;
  }

  const matchedContent = allPolicies.find((item) => {
    return item._meta.fileName === `${locale}.md` && item._meta.directory === dir;
  });

  return {
    isDefault: !matchedContent,
    res: matchedContent ?? hasDefaultLocaleContent,
  };
}
