import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "next-themes";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import { defaultLocale, getHTMLTextDir } from "intlayer";
import { IntlayerProvider } from "react-intlayer";
import { LocaleSwitcher } from "@/components/LanguageSwitcher";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fonts } from "@/utils/fonts";

import appCss from "../styles.css?url";
import fontCss from "../styles/fonts.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      ...fonts(),
      {
        rel: "stylesheet",
        href: fontCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const matches = useMatches();

  const localeRoute = matches.find((match) => match.routeId === "/{-$locale}");
  const locale = localeRoute?.params?.locale ?? defaultLocale;

  return (
    <html lang={locale} dir={getHTMLTextDir(locale)} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body cz-shortcut-listen="true">
        <ThemeProvider>
          <IntlayerProvider locale={locale}>
            <TooltipProvider>
              <LocaleSwitcher />
              {children}
            </TooltipProvider>
          </IntlayerProvider>
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
