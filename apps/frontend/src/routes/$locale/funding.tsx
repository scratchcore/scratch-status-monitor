import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArticleLayout } from "@/components/markdown/layout";
import { getContent } from "@/lib/cc-loader.functions";
import { buildHreflangLinks } from "@/seo/hreflang";
import { mergeHead, whenHead } from "@/seo/merge";

const PAGE_KEY = "funding";

export const Route = createFileRoute("/$locale/funding")({
  loader: ({ params }) => {
    const { locale } = params;
    const content = getContent(locale, PAGE_KEY);

    if (!content) {
      throw redirect({
        to: "/$locale/404",
        params: { locale },
      });
    }

    return {
      locale,
      content,
    };
  },
  head: ({ params, loaderData }) =>
    mergeHead(
      {
        links: buildHreflangLinks({ locale: params.locale, path: "/funding" }),
      },
      whenHead(loaderData, (data) => ({
        meta: [
          {
            title: data.content.res.title,
          },
        ],
      }))
    ),
  component: RouteComponent,
  onEnter: () => {
    window.scrollTo(0, 0);
  },
});

function RouteComponent() {
  const loaderData = Route.useLoaderData();

  return (
    <ArticleLayout
      isDefault={loaderData.content.isDefault}
      updated_at={loaderData.content.res.updated_at}
      locale={loaderData.locale}
      code={loaderData.content.res.mdx}
      mode="mdx"
    />
  );
}
