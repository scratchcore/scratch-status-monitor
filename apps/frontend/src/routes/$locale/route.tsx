import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { defaultLocale, validatePrefix } from "intlayer";
import { Footer } from "@/components/footer";
import fontCss from "@/styles/fonts.css?url";
import typographyCss from "@/styles/typography.css?url";
import appCss from "@/styles.css?url";
import { NotFoundComponent } from "./404";
import { fonts } from "@/utils/fonts";
import { icons } from "@/seo";

export const Route = createFileRoute("/$locale")({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...(icons({ themeColor: "#000000" }).meta ?? []),
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: typographyCss,
      },
      ...fonts(),
      {
        rel: "stylesheet",
        href: fontCss,
      },
      ...(icons({ themeColor: "#000000", pngSizes: [128, 192, 256, 512] }).links ?? []),
    ],
  }),
  beforeLoad: ({ params }) => {
    // Get locale from route params (not from server headers, as beforeLoad runs on both client and server)
    const localeParam = params.locale;
    // If no locale provided (optional param), it's valid (will use default)
    // In prefix-all mode, the locale is required to be a valid locale
    const { isValid, localePrefix } = validatePrefix(localeParam, {
      mode: "prefix-all",
    });

    if (isValid) {
      // If locale is valid, continue
      return;
    }

    throw redirect({
      params: { locale: localePrefix ?? defaultLocale },
      to: "/$locale/404",
    });
  },
  component: RootDocument,
  notFoundComponent: NotFoundComponent,
});

function RootDocument() {
  return (
    <div>
      <Outlet />
      <Footer />
    </div>
  );
}
