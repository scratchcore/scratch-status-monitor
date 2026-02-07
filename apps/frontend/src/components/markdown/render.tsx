import { MDXContent } from "@content-collections/mdx/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "./components";

export interface MarkdownRenderProps {
  mode?: "md" | "mdx";
  code?: string;
}
export function MarkdownRender({ ...props }: MarkdownRenderProps) {
  const { code = "", mode = "md" } = props;

  return mode === "mdx" ? (
    <MDXContent components={markdownComponents} code={code} />
  ) : (
    <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {code}
    </Markdown>
  );
}
