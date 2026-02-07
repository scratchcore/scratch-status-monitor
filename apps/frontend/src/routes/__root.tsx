// Providers
import { ProgressProvider } from "@bprogress/react";
// devtools
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

// i18n
import { defaultLocale, getHTMLTextDir } from "intlayer";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { IntlayerProvider } from "react-intlayer";
import { TooltipProvider } from "@/components/ui/tooltip";
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
                <TooltipProvider>{children}</TooltipProvider>
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
        <Scripts />
      </body>
    </html>
  );
}
