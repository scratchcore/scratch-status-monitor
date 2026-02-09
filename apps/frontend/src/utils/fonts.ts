import type { AnyRouteMatch } from "@tanstack/react-router";

export const fonts = () => {
  const spWoff2 = (slug: string, type: string) => {
    return [
      {
        rel: "preload",
        as: "font",
        href: `/wp-content/fonts/${slug}-${type}.woff2`,
        type: "font/woff2",
        crossOrigin: "anonymous" as const,
      },
    ];
  };

  const links: AnyRouteMatch["links"] = [
    ...spWoff2("SNPro", "ExtraLight"),
    ...spWoff2("SNPro", "Light"),
    ...spWoff2("SNPro", "Regular"),
    ...spWoff2("SNPro", "Medium"),
    ...spWoff2("SNPro", "SemiBold"),
    ...spWoff2("SNPro", "Bold"),
    ...spWoff2("SNPro", "ExtraBold"),
    ...spWoff2("SNPro", "Black"),
    ...spWoff2("SNPro", "Italic"),
  ];
  return links;
};
