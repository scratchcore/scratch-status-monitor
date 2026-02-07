import { AnchorHTMLAttributes } from "react";

export interface MarkdownAProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}
export const markdown_a = (props: MarkdownAProps) => {
  const { href, ...rest } = props;
  let isExternal = false;
  if (href && href.startsWith("http")) {
    isExternal = true;
  }

  return (
    <a
      href={href}
      rel={isExternal ? "noopener noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
      {...rest}
    />
  );
};

