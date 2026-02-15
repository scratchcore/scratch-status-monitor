import { RiExternalLinkFill } from "@remixicon/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { LocalizedLink } from "@/components/LocalizedLink";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { getAllPolicy } from "@/lib/cc-loader.functions";
import { buildHreflangLinks } from "@/seo";
import { scrollToTop } from "@/utils/onenter.scrollTo";

export const Route = createFileRoute("/$locale/policies/")({
  loader: ({ params }) => {
    const { locale } = params;
    const content = getAllPolicy(locale);

    if (!content) {
      throw notFound();
    }

    return {
      locale,
      content,
    };
  },
  head: ({ params }) => {
    return {
      meta: [
        {
          title: "Policies",
        },
      ],
      links: buildHreflangLinks({
        locale: params.locale,
        path: `/policies`,
      }),
    };
  },
  component: RouteComponent,
  onEnter: scrollToTop,
});

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-3xl p-4 lg:py-8">
      <h1 className="text-3xl font-bold mb-6">Policies</h1>
      <ItemGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loaderData.content.map((policy, index) => (
          <Item key={index} variant="outline" size="sm" asChild>
            <LocalizedLink
              to="/policies/$policyId"
              params={{ policyId: policy.res._meta.directory }}
            >
              <ItemContent>
                <ItemTitle>{policy.res.title}</ItemTitle>
                <ItemDescription>
                  {policy.res.updated_at
                    ? new Date(policy.res.updated_at).toLocaleDateString(loaderData.locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </ItemDescription>
                <Badge>{policy.isDefault ? "Default" : "Translated"}</Badge>
              </ItemContent>
              <ItemActions>
                <RiExternalLinkFill size={16} />
              </ItemActions>
            </LocalizedLink>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}
