import { allContents } from "content-collections";
import { configuration } from "intlayer";

export function getContent(locale: string, dir: string) {
  const {
    internationalization: { defaultLocale },
  } = configuration;

  const hasDefaultLocaleContent = allContents.find((item) => {
    return (
      item._meta.fileName === `${defaultLocale}.mdx` &&
      item._meta.directory === dir
    );
  });

  if (!hasDefaultLocaleContent) {
    return null;
  }

  const matchedContent = allContents.find((item) => {
    return (
      item._meta.fileName === `${locale}.mdx` && item._meta.directory === dir
    );
  });

  return {
    isDefault: matchedContent ? false : true,
    res: matchedContent ?? hasDefaultLocaleContent,
  };
}
