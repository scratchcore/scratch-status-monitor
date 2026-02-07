import { MDXContent } from "@content-collections/mdx/react";
import {markdownComponents} from "./components";

export interface MarkdownProps {
  code?: string;
}
export function Markdown({ ...props }: MarkdownProps) {
  const { code = "" } = props;

  return <MDXContent code={code} components={markdownComponents} />;
}
