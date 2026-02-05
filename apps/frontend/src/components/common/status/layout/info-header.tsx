import { cx } from "@/lib/utils";
import { useIntlayer, useLocale } from "react-intlayer";
import { StatusIcon } from "../ui/icon";
import { formatDateTime } from "@/lib/status-page/data";
import {
  useStatusPageCountdownContext,
  useStatusPageDataContext,
} from "./context";

export function InfoHeader() {
  const s = useStatusPageDataContext();
  const c = useStatusPageCountdownContext();
  const t = useIntlayer("status");
  const { locale } = useLocale();

  // 最新の履歴レコードからタイムスタンプを取得
  const latestTimestamp =
    s.histories[0]?.newestRecord || new Date().toISOString();

  return (
    <div className="flex flex-col items-center">
      <span
        className={cx(
          "mx-auto inline-flex items-center justify-center rounded-full",
          `bg-${s.colorSlug}-100 dark:bg-${s.colorSlug}-400/20 dark:to-${s.colorSlug}-500/10`,
        )}
      >
        <span
          className={`absolute inline-flex h-10 w-10 scale-65 rounded-full bg-${s.colorSlug}-500 animate-ping`}
        />
        <span className="absolute inline-flex w-8 h-8 bg-background rounded-full" />
        <StatusIcon
          tooltip={s.overallTooltip}
          className={`relative h-10 w-10 text-${s.colorSlug}-500`}
        />
      </span>
      <h1 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-50">
        {t.header.overallStatus}: {t.statusLevel[s.overallStatus]}
      </h1>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {t.header.lastUpdated}: {formatDateTime(latestTimestamp, locale)}
      </p>
      {c.formattedRemaining ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t.header.nextUpdate}: {c.formattedRemaining}
          {s.refreshHint ? `（${s.refreshHint}）` : ""}
        </p>
      ) : null}
    </div>
  );
}
