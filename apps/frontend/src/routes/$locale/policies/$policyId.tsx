import { createFileRoute, redirect } from "@tanstack/react-router";
import { IsDefaultNotice } from "@/components/markdown/is-default";
import { MarkdownRender } from "@/components/markdown/render";
import { getPolicy } from "@/lib/cc-loader.functions";

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
  component: RouteComponent,
  onEnter: () => {
    window.scrollTo(0, 0);
  },
});

function RouteComponent() {
  const loaderData = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-3xl p-4 lg:py-8">
      {loaderData.content.isDefault && <IsDefaultNotice />}
      <article className="typography w-full max-w-full!">
        <MarkdownRender code={loaderData.content.res.content} mode="md" />
      </article>
    </div>
  );
}
