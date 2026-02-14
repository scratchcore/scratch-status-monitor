import type { HeadType } from "./types/head";

/**
 * ヘッダーのレンダリングコンポーネント
 * @param param0
 * @returns
 */
export const HeadRender = ({ head }: { head: HeadType.index }) => {
  const meta = head.meta?.map((meta, index) => {
    if (meta?.title) {
      return <title key={index}>{meta.title}</title>;
    }
    return <meta key={index} {...meta} />;
  });

  const links = head.links?.map((link, index) => {
    return <link key={index} {...link} />;
  });

  const styles = head.styles?.map((style, index) => {
    return <style key={index} {...style} />;
  });

  const scripts = head.scripts?.map((script, index) => {
    return <script key={index} {...script} />;
  });

  return (
    <>
      {meta}
      {links}
      {styles}
      {scripts}
    </>
  );
};
