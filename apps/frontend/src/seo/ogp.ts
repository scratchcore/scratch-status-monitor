import type { AnyRouteMatch } from "@tanstack/react-router";
import { getEnv } from "@/plugins/envrc";

export interface OGPData {
  url?: string;
  siteName?: string;
  title: string;
  excerpt: string;
  coverImage: string;
  type: "website" | "profile" | "book" | "article" | "blog";
  cardType?: "summary" | "summary_large_image" | "app" | "player";
}
export const ogp = (data: OGPData) => {
  const env = getEnv();
  const {
    url = env.VITE_SITE_BASE_URL,
    siteName = "Scratch Status Monitor",
    title,
    excerpt,
    coverImage,
    type = "website",
    cardType = "summary_large_image",
  } = data;
  const head: AnyRouteMatch["meta"] = [
    // Open Graph
    { property: "og:url", content: url },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: title },
    { property: "og:description", content: excerpt },
    { property: "og:image", content: coverImage },
    { property: "og:type", content: type },
    // Twitter Card
    { name: "twitter:url", content: url },
    { name: "twitter:card", content: cardType },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: excerpt },
    { name: "twitter:image", content: coverImage },
  ];

  return head;
};
