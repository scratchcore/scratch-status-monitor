import { createFileRoute, redirect } from "@tanstack/react-router";
import { IsDefaultNotice } from "@/components/markdown/is-default";
import { Markdown } from "@/components/markdown/render";
import { getContent } from "@/lib/cc-loader.functions";

const PAGE_KEY = "about";

export const Route = createFileRoute("/$locale/about")({
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
        <Markdown code={loaderData.content.res.mdx} />
      </article>
    </div>
  );
}
