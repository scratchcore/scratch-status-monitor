import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArticleLayout } from "@/components/markdown/layout";
import { getPolicy } from "@/lib/cc-loader.functions";
import { buildHreflangLinks } from "@/seo/hreflang";

export const Route = createFileRoute("/$locale/policies/$policyId")({
  loader: ({ params }) => {
    const { locale, policyId } = params;
    const content = getPolicy(locale, policyId);

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
  head: ({ params }) => ({
    links: buildHreflangLinks({
      locale: params.locale,
      path: `/policies/${params.policyId}`,
    }),
  }),
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
      code={loaderData.content.res.content}
      mode="md"
    />
  );
}
