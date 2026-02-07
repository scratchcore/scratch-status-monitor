import {
  RiCopyrightLine,
  RiCreativeCommonsByLine,
  RiCreativeCommonsNcLine,
} from "@remixicon/react";
import { ThemeTogglerButton } from "./animate-ui/components/buttons/theme-toggler";
import { LocaleSwitcher } from "./LanguageSwitcher";
import { LocalizedLink, type To } from "./LocalizedLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type LinkItem =
  | { name: string; to: string; href?: never; badge?: string }
  | { name: string; to?: never; href: string; badge?: string };

type Items = {
  title: string;
  links: LinkItem[];
};
const items: Items[] = [
  {
    title: "製品",
    links: [
      { name: "モニター", to: "/" },
      { name: "公開API", to: "/api", badge: "開発中" },
    ],
  },
  {
    title: "リソース",
    links: [
      { name: "概要", to: "/about" },
      { name: "使い方", to: "/docs/usage" },
      { name: "仕組み", to: "/docs/how-it-works" },
      { name: "FAQ", to: "/docs/faq" },
    ],
  },
  {
    title: "運営",
    links: [
      { name: "チーム", to: "/team" },
      { name: "GitHub", href: "https://github.com/scratchcore" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="max-w-3xl mx-auto py-8 lg:py-24">
      <div className="max-w-7xl mx-auto border-t">
        <div className="flex flex-col gap-y-12 px-4 xl:px-0 py-6 lg:py-12">
          <div className="grid gap-y-6 sm:grid-cols-2 sm:gap-x-8 md:px-4 lg:grid-cols-4 lg:gap-x-12 lg:gap-y-0 lg:px-8">
            <figure>
              <img
                className="h-8"
                src="https://tailkits.com/ui/iframe/assets/img/logo-big.svg"
                alt="Logo"
              />
            </figure>
            {items.map((item) => (
              <div key={item.title} className="flex flex-col items-start gap-y-4">
                <div className="text-sm font-bold text-foreground">{item.title}</div>
                <div className="flex flex-col items-start gap-y-1.5">
                  {item.links.map((link) => {
                    const isInternalLink = "to" in link && link.to !== undefined;
                    const isExternalLink = "href" in link && link.href !== undefined;

                    return (
                      <div
                        key={link.name}
                        className="flex flex-wrap items-center gap-1 text-muted-foreground/80"
                      >
                        {isInternalLink ? (
                          <LocalizedLink
                            className="whitespace-nowrap text-sm font-medium"
                            to={link.to as To}
                            title={link.name}
                            resetScroll={true}
                          >
                            {link.name}
                          </LocalizedLink>
                        ) : isExternalLink ? (
                          <LocalizedLink
                            className="whitespace-nowrap text-sm font-medium"
                            href={link.href}
                            title={link.name}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link.name}
                          </LocalizedLink>
                        ) : null}
                        {link.badge && (
                          <div className="bg-accent text-accent-foreground text-xs font-medium whitespace-nowrap inline-flex justify-center items-center ml-1 px-1.5 py-0.5 rounded-full shadow-[0_2px_10px_0px_rgba(0,0,0,0.15)]">
                            {link.badge}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-start justify-between gap-8 md:px-4 lg:px-8">
            <div className="flex flex-col gap-3 lg:gap-4">
              <div className="text-sm font-medium text-muted-foreground/80">
                <RiCopyrightLine className="inline-flex pb-1" size={18} />
                <time>2024-2026</time> ScratchCore. All rights reserved.
              </div>
              <div className="flex flex-wrap items-center gap-4"></div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap text-sm font-medium text-muted-foreground/80">
                <Tooltip>
                  <TooltipTrigger>
                    <RiCreativeCommonsByLine />
                  </TooltipTrigger>
                  <TooltipContent>BY (Attribution)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <RiCreativeCommonsNcLine />
                  </TooltipTrigger>
                  <TooltipContent>NC (Non-Commercial)</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-12 px-4 xl:px-0 py-4">
          <div className="flex flex-wrap items-start justify-between gap-8 md:px-4 lg:px-8">
            <div className="flex flex-wrap gap-3 lg:gap-4">
              <ThemeTogglerButton />
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
