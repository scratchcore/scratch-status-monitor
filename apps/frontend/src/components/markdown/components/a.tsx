import { RiExternalLinkLine } from "@remixicon/react";
import type { AnchorHTMLAttributes } from "react";
import { LocalizedLink, type To } from "@/components/LocalizedLink";
import { cn } from "@/lib/utils";

export interface MarkdownAProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}
export const markdown_a = (props: MarkdownAProps) => {
  const { children, className, href, ...rest } = props;

  const linkClassName = cn(
    "inline-flex items-center whitespace-nowrap hover:opacity-90 transition-opacity duration-100 ease-linear",
    className
  );

  // href が存在しない場合はデフォルトの内部リンク
  if (!href) {
    return (
      <LocalizedLink to="/" className={linkClassName} {...rest}>
        {children}
      </LocalizedLink>
    );
  }

  const isExternal = href.startsWith("http") || href.startsWith("/s/");

  // 外部リンクの場合
  if (isExternal) {
    return (
      <LocalizedLink
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        className={linkClassName}
        {...rest}
      >
        {children}
        <RiExternalLinkLine size={14} className="ml-1" />
      </LocalizedLink>
    );
  }

  // 内部リンクの場合
  return (
    <LocalizedLink to={href as To} className={linkClassName} {...rest}>
      {children}
    </LocalizedLink>
  );
};
