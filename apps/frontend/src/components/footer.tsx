import {
  RiCopyrightLine,
  RiCreativeCommonsByLine,
  RiCreativeCommonsNcLine,
  RiExternalLinkLine,
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
    title: "リソース",
    links: [
      { name: "モニター", to: "/" },
      { name: "概要", to: "/about" },
      { name: "使い方", to: "/usage" },
      { name: "仕組み", to: "/how-it-works" },
      {
        name: "FAQ",
        href: "/s/gh/faq",
      },
    ],
  },
  {
    title: "詳細",
    links: [
      { name: "チーム", to: "/team" },
      {
        name: "問題",
        href: "/s/gh/issues",
      },
      {
        name: "議論",
        href: "/s/gh/discussions",
      },
      { name: "リポジトリ", href: "/s/gh/repo" },
      { name: "GitHub", href: "/s/gh/org" },
    ],
  },
  {
    title: "ポリシー",
    links: [
      { name: "プライバシーポリシー", to: "/policies/privacy" },
      { name: "クッキーポリシー", to: "/policies/cookie" },
      { name: "データポリシー", to: "/policies/data" },
      { name: "外部サービス利用ポリシー", to: "/policies/external-service" },
      { name: "利用規約", to: "/policies/terms" },
      { name: "免責事項", to: "/policies/disclaimer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="max-w-3xl mx-auto py-8 lg:py-24">
      <div className="max-w-7xl mx-auto border-t">
        <div className="flex flex-col gap-y-12 px-4 xl:px-0 py-6 lg:py-12">
          <div className="grid gap-y-6 sm:grid-cols-2 sm:gap-x-8 md:px-4 lg:grid-cols-4 lg:gap-x-12 lg:gap-y-0 lg:px-8">
            <div className="w-30">
              <img src="/wp-content/scrac/cat/black.png" alt="Logo" className="block dark:hidden" />
              <img src="/wp-content/scrac/cat/white.png" alt="Logo" className="hidden dark:block" />
            </div>
            {items.map((item) => (
              <div key={item.title} className="flex flex-col items-start gap-y-4">
                <div className="text-sm font-bold text-foreground">{item.title}</div>
                <div className="flex flex-col items-start gap-y-1.5">
                  {item.links.map((link) => {
                    const isInternalLink = "to" in link && link.to !== undefined;
                    const isExternalLink = "href" in link && link.href !== undefined;
                    const className =
                      "inline-flex items-center whitespace-nowrap text-sm font-medium hover:opacity-90 transition-all duration-100 hover:underline hover:underline-offset-4";

                    return (
                      <div
                        key={link.name}
                        className="flex flex-wrap items-center gap-1 text-muted-foreground/80"
                      >
                        {isInternalLink ? (
                          <LocalizedLink
                            className={className}
                            to={link.to as To}
                            title={link.name}
                            resetScroll={true}
                            activeOptions={{ exact: true }}
                            activeProps={{
                              className:
                                "text-primary opacity-50 cursor-not-allowed pointer-events-none",
                            }}
                          >
                            {link.name}
                          </LocalizedLink>
                        ) : isExternalLink ? (
                          <LocalizedLink
                            className={className}
                            href={link.href}
                            title={link.name}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link.name}
                            <RiExternalLinkLine size={14} className="ml-1" />
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
