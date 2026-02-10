import { ProgressProvider } from "@bprogress/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  ClientOnly,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { defaultLocale, getHTMLTextDir } from "intlayer";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { IntlayerProvider } from "react-intlayer";
import { CookieNotice } from "@/components/cookie-notice";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import BMCWidget from "@/lib/bmc-widget";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

interface MyRouterContext {
  queryClient: QueryClient;
}

function RootErrorComponent() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-destructive/10">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-destructive">エラーが発生しました</h1>
        <div className="bg-white p-4 rounded-md border border-destructive/30 space-y-2">
          <p className="text-sm text-muted-foreground">
            問題が発生した場合は、以下をお試しください：
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>ページをリロードする</li>
            <li>ブラウザの開発ツール（F12）でコンソールを確認</li>
            <li>ネットワークタブでリクエスト/レスポンスを確認</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          ページをリロード
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    scripts: [
      // Google Tag Manager script
      {
        children: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-PCFR4FBN');
        `,
      },
    ],
  }),
  shellComponent: RootDocument,
  errorComponent: RootErrorComponent,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const matches = useMatches();

  const localeRoute = matches.find((match) => match.routeId === "/$locale");
  const locale = localeRoute?.params?.locale ?? defaultLocale;

  return (
    <html lang={locale} dir={getHTMLTextDir(locale)} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body cz-shortcut-listen="true" className="scrollbar-simple">
        <ProgressProvider color="var(--primary)" options={{ showSpinner: true }}>
          <IntlayerProvider locale={locale}>
            <NuqsAdapter>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <TooltipProvider>
                  <Toaster />
                  {children}
                  <ClientOnly>
                    <CookieNotice />
                    <BMCWidget />
                  </ClientOnly>
                </TooltipProvider>
              </ThemeProvider>
            </NuqsAdapter>
          </IntlayerProvider>
        </ProgressProvider>
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
        <noscript>
          <iframe
            title="gtm"
            src="https://www.googletagmanager.com/ns.html?id=GTM-PCFR4FBN"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Scripts />
      </body>
    </html>
  );
}
