import type { AnyRouteMatch } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

export const seo = (locale?: string) => {
  const t = getIntlayer("seo", locale);
  const head: AnyRouteMatch["meta"] = [
    {
      title: t.title,
    },
    {
      name: "description",
      content: t.description,
    },
    {
      name: "keywords",
      content: t.keywords,
    },
  ];

  return head;
};
