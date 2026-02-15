import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArticleLayout } from "@/components/markdown/layout";
import { getContent } from "@/lib/cc-loader.functions";
import { buildHreflangLinks } from "@/seo/hreflang";
import { scrollToTop } from "@/utils/onenter.scrollTo";

const PAGE_KEY = "team";

export const Route = createFileRoute("/$locale/team")({
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
  head: (ctx) => ({
    meta: [
      {
        title: ctx.loaderData?.content.res.title,
      },
    ],
    links: buildHreflangLinks({ locale: ctx.params.locale, path: "/team" }),
  }),
  component: RouteComponent,
  onEnter: scrollToTop,
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
