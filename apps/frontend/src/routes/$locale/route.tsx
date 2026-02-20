import { headControllerContextEdit } from "@scracc/tanstack-plugin-headcontroller";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { Footer } from "@/components/footer";
import { icons } from "@/seo";
import { ogp } from "@/seo/ogp";
import fontCss from "@/styles/fonts.css?url";
import typographyCss from "@/styles/typography.css?url";
import appCss from "@/styles.css?url";
import { fonts } from "@/utils/fonts";
import { NotFoundComponent } from "./404";

// OGP 設定
const OGP_CONFIG = {
  coverImage: "/wp-content/scrac/cat/icons/icon.256x256.png",
  cardType: "summary" as const,
  type: "website" as const,
};

// アイコン設定
const ICON_CONFIG = {
  themeColor: "#000000",
};

const ICON_CONFIG_WITH_SIZES = {
  ...ICON_CONFIG,
  pngSizes: [128, 192, 256, 512],
};

// スタイルシート
const STYLESHEETS = [
  { rel: "stylesheet", href: appCss },
  { rel: "stylesheet", href: typographyCss },
  { rel: "stylesheet", href: fontCss },
];

export const Route = createFileRoute("/$locale")({
  context(ctx) {
    const locale = ctx.params.locale;
    const t = getIntlayer("seo", locale);

    return headControllerContextEdit(ctx.context, {
      configs: {
        titleTemplate: {
          default: t.title,
          template: `%s | ${t.title_short}`,
        },
        ogp: {
          mode: "use-meta-title",
        },
      },
    });
  },
  head: ({ params }) => {
    const locale = params.locale;
    const t = getIntlayer("seo", locale);

    return {
      meta: [
        ...(icons(ICON_CONFIG).meta ?? []),
        ...ogp({
          title: t.title,
          excerpt: t.description,
          coverImage: OGP_CONFIG.coverImage,
          cardType: OGP_CONFIG.cardType,
          type: OGP_CONFIG.type,
        }),
      ],
      links: [...STYLESHEETS, ...fonts(), ...(icons(ICON_CONFIG_WITH_SIZES).links ?? [])],
    };
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
