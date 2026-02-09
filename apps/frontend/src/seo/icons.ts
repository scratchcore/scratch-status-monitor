import type { AnyRouteMatch } from "@tanstack/react-router";

/**
 * アイコン設定のオプション
 */
export interface IconOptions {
  /**
   * アイコンのベースパス
   * @default "/wp-content/scrac/cat/icons"
   */
  basePath?: string;
  /**
   * favicon のファイル名
   * @default "favicon.ico"
   */
  faviconName?: string;
  /**
   * Apple touch icon のファイル名
   * @default "apple-touch-icon.png"
   */
  appleTouchIconName?: string;
  /**
   * PNG アイコンのサイズ配列
   * @default [192, 512]
   */
  pngSizes?: number[];
  /**
   * テーマカラー
   */
  themeColor?: string;
}

/**
 * メタデータのアイコン設定を生成するユーティリティ
 *
 * favicon、Apple touch icon、PWA用のアイコンなどを設定します。
 *
 * @param options - アイコン設定のオプション
 * @returns TanStack Router の meta と links 設定
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/some-route')({
 *   head: () => ({
 *     ...icons(),
 *   }),
 * });
 * ```
 *
 * @example
 * ```ts
 * // カスタム設定
 * export const Route = createFileRoute('/some-route')({
 *   head: () => ({
 *     ...icons({
 *       basePath: '/custom/icons',
 *       themeColor: '#ff0000',
 *       pngSizes: [128, 192, 256, 512],
 *     }),
 *   }),
 * });
 * ```
 */
export const icons = (options: IconOptions = {}): Pick<AnyRouteMatch, "meta" | "links"> => {
  const {
    basePath = "/wp-content/scrac/cat/icons",
    faviconName = "favicon.ico",
    appleTouchIconName = "apple-touch-icon.png",
    pngSizes = [192, 512],
    themeColor,
  } = options;

  const meta: AnyRouteMatch["meta"] = [];
  const links: AnyRouteMatch["links"] = [];

  // Theme color
  if (themeColor) {
    meta.push({
      name: "theme-color",
      content: themeColor,
    });
  }

  // Favicon
  links.push({
    rel: "icon",
    href: `${basePath}/${faviconName}`,
    type: "image/x-icon",
  });

  // Apple touch icon
  links.push({
    rel: "apple-touch-icon",
    href: `${basePath}/${appleTouchIconName}`,
  });

  // Apple touch icon with sizes
  links.push(
    {
      rel: "apple-touch-icon",
      sizes: "152x152",
      href: `${basePath}/apple-touch-icon-152.png`,
    },
    {
      rel: "apple-touch-icon",
      sizes: "167x167",
      href: `${basePath}/apple-touch-icon-167.png`,
    }
  );

  // PNG icons for various sizes (PWA, etc.)
  for (const size of pngSizes) {
    links.push({
      rel: "icon",
      type: "image/png",
      sizes: `${size}x${size}`,
      href: `${basePath}/icon.${size}x${size}.png`,
    });
  }

  return { meta, links };
};

/**
 * サークル型のアイコン設定を生成するユーティリティ
 *
 * @param options - アイコン設定のオプション
 * @returns TanStack Router の meta と links 設定
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/some-route')({
 *   head: () => ({
 *     ...circleIcons(),
 *   }),
 * });
 * ```
 */
export const circleIcons = (
  options: Omit<IconOptions, "faviconName"> = {}
): Pick<AnyRouteMatch, "meta" | "links"> => {
  const { basePath = "/wp-content/scrac/cat/icons", pngSizes = [192, 512], themeColor } = options;

  const meta: AnyRouteMatch["meta"] = [];
  const links: AnyRouteMatch["links"] = [];

  // Theme color
  if (themeColor) {
    meta.push({
      name: "theme-color",
      content: themeColor,
    });
  }

  // Circle favicon
  links.push({
    rel: "icon",
    href: `${basePath}/favicon-circle.ico`,
    type: "image/x-icon",
  });

  // Apple touch icon (circle)
  links.push({
    rel: "apple-touch-icon",
    href: `${basePath}/apple-touch-icon.png`,
  });

  // Circle PNG icons
  for (const size of pngSizes) {
    links.push({
      rel: "icon",
      type: "image/png",
      sizes: `${size}x${size}`,
      href: `${basePath}/icon-circle.${size}x${size}.png`,
    });
  }

  return { meta, links };
};
