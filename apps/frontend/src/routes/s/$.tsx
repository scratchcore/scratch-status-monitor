import { ssmrc } from "@scratchcore/ssm-configs";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/s/$")({
  beforeLoad: ({ params }) => {
    const pathKey = params._splat || "";

    // 短縮URLマッピングから URL を検索
    const mapping = ssmrc.shortUrls.find((item) => item.key === pathKey);

    if (!mapping) {
      // マッピングが見つからない場合、ホームへリダイレクト
      console.warn(`Short URL not found: ${pathKey}`);
      const redirectPath = `/${pathKey}`;
      throw redirect({
        to: redirectPath,
        replace: true,
      });
    }
    // マッピングが見つかった場合、その URL へリダイレクト
    throw redirect({
      href: mapping.url,
      replace: true,
    });
  },
});
