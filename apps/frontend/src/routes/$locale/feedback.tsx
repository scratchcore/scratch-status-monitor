import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArticleLayout } from "@/components/markdown/layout";
import { getContent } from "@/lib/cc-loader.functions";
import { buildHreflangLinks } from "@/seo";
import { scrollToTop } from "@/utils/onenter.scrollTo";

export const Route = createFileRoute("/$locale/feedback")({
  loader: ({ params }) => {
    const { locale } = params;
    const content = getContent(locale, "feedback");

    if (!content) {
      throw notFound();
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
    links: buildHreflangLinks({ locale: ctx.params.locale, path: "/feedback" }),
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
