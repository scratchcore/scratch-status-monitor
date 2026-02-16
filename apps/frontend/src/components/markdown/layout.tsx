import { HeaderNotice } from "./headet";
import { MarkdownRender } from "./render";
import { UpdatedAtContent } from "./updated-at";

export interface ArticleLayoutProps {
  isDefault: boolean;
  updated_at?: string;
  locale: string;
  code?: string;
  mode?: "md" | "mdx";
}
export function ArticleLayout(props: ArticleLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl p-4 lg:py-8">
      <HeaderNotice isDefault={props.isDefault} locale={props.locale} />
      <UpdatedAtContent updated_at={props.updated_at} locale={props.locale} />
      <article className="typography w-full max-w-full!">
        <MarkdownRender code={props.code} mode={props.mode} />
      </article>
    </div>
  );
}
