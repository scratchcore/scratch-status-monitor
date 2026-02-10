import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface MarkdownImgProps extends ImgHTMLAttributes<HTMLImageElement> {}
export const markdown_img = (props: MarkdownImgProps) => {
  const { children, className, ...rest } = props;

  const classNameCombined = cn("", className);

  // 内部リンクの場合
  return <img aria-label="Image" className={classNameCombined} {...rest} />;
};
