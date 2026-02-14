import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { scrollToTop } from "@/utils/onenter.scrollTo";
import { NotFoundComponent } from "./404";

// Catch-all route for unknown paths - renders the 404 page
export const Route = createFileRoute("/$locale/$")({
  head: ({ params }) => {
    const t = getIntlayer("not-found", params.locale);
    return {
      meta: [
        {
          title: t.title,
        },
        {
          name: "description",
          content: t.subtitle,
        },
      ],
    };
  },
  component: NotFoundComponent,
  onEnter: scrollToTop,
});
