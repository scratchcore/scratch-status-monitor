import { createFileRoute, redirect } from "@tanstack/react-router";
import { getContent } from "@/lib/cc-loader.functions";
import { Markdown } from "@/components/markdown/render";
import { getIntlayer } from "intlayer";
import { NotFoundComponent } from "./404";
import { IsDefaultNotice } from "@/components/markdown/is-default";

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
  head: ({ params }) => {
    const { locale } = params;
    const metaContent = getIntlayer("page-metadata", locale);
    return {
      meta: [
        {
          title: metaContent.team.title,
        },
      ],
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
