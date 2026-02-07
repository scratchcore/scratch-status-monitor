import { createFileRoute, redirect } from "@tanstack/react-router";
import { getContent } from "@/lib/cc-loader.functions";
import { Markdown } from "@/components/markdown/render";
import { NotFoundComponent } from "./404";
import { IsDefaultNotice } from "@/components/markdown/is-default";

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
  notFoundComponent: NotFoundComponent,
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
