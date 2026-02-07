import { createFileRoute } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";

import { LocalizedLink } from "@/components/LocalizedLink";

export const Route = createFileRoute("/$locale/404")({
  component: NotFoundComponent,
  onEnter: () => {
    window.scrollTo(0, 0);
  },
});

export function NotFoundComponent() {
  const { backHome, lostMessage, subtitle, title } = useIntlayer("not-found");

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center px-4 text-center pt-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <h1 className="font-bold text-[10rem] text-primary leading-none tracking-tighter opacity-10 md:text-[14rem]">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-6xl text-primary md:text-8xl">404</span>
          </div>
        </div>

        <h2 className="font-bold text-2xl text-muted-foreground md:text-4xl">{title}</h2>

        <p className="font-medium text-destructive text-lg italic">{lostMessage}</p>

        <p className="max-w-md text-muted-foreground text-xl">{subtitle}</p>

        <LocalizedLink
          className="mt-4 rounded-xl bg-primary px-8 py-4 font-semibold text-secondary transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25 hover:shadow-lg"
          to="/"
        >
          {backHome}
        </LocalizedLink>
      </div>
    </div>
  );
}
