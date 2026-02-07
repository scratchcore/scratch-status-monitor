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

export function getPolicy(locale: string, dir: string) {
  const {
    internationalization: { defaultLocale },
  } = configuration;

  const hasDefaultLocaleContent = allPolicies.find((item) => {
    return item._meta.fileName === `${defaultLocale}.md` && item._meta.directory === dir;
  });
  console.log("hasDefaultLocaleContent:", hasDefaultLocaleContent);

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
