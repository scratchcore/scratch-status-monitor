import type { FC } from "react";
import type { AnchorHTMLAttributes } from "react";

import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { useLocale } from "react-intlayer";
import { getPrefix } from "intlayer";

export const LOCALE_ROUTE = "$locale" as const;

// メインユーティリティ
export type RemoveLocaleParam<T> = T extends string
  ? RemoveLocaleFromString<T>
  : T;

export type To = RemoveLocaleParam<LinkComponentProps["to"]>;

type CollapseDoubleSlashes<S extends string> =
  S extends `${infer H}//${infer T}` ? CollapseDoubleSlashes<`${H}/${T}`> : S;

type InternalLinkProps = {
  to: To;
  href?: never;
} & Omit<LinkComponentProps, "to">;

type ExternalLinkProps = {
  to?: never;
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

type LocalizedLinkProps = InternalLinkProps | ExternalLinkProps;

// ヘルパー
type RemoveAll<
  S extends string,
  Sub extends string,
> = S extends `${infer H}${Sub}${infer T}` ? RemoveAll<`${H}${T}`, Sub> : S;

type RemoveLocaleFromString<S extends string> = CollapseDoubleSlashes<
  RemoveAll<S, typeof LOCALE_ROUTE>
>;

export const LocalizedLink: FC<LocalizedLinkProps> = (props) => {
  const { locale } = useLocale();
  const { localePrefix } = getPrefix(locale, { mode: "prefix-all" });

  // 外部リンク（href）の場合は通常の <a> タグを返す
  if ("href" in props && props.href) {
    const { href, ...restProps } = props;
    return <a href={href} {...restProps} />;
  }

  // 内部リンク（to）の場合は TanStack Router の Link を返す
  if ("to" in props && props.to) {
    const { to, ...restProps } = props;
    return (
      <Link
        {...restProps}
        params={{
          locale: localePrefix,
          ...(typeof restProps?.params === "object" ? restProps?.params : {}),
        }}
        to={`/${LOCALE_ROUTE}${to}` as LinkComponentProps["to"]}
      />
    );
  }

  // どちらもない場合はエラー（TypeScript で防げるはず）
  return null;
};
