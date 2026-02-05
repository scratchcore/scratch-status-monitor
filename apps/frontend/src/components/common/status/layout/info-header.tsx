import { cx } from "@/lib/utils";
import { StatusIcon } from "../icon";
import { statusLabel } from "../rc";
import { useContext } from "react";
import { formatDateTime } from "../data";
import { StatusPageContext } from "./context";

export function InfoHeader() {
  const s = useContext(StatusPageContext);
  if (!s) return null;

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
        <span className="absolute inline-flex w-8 h-8 bg-background rounded-full"/>
        <StatusIcon
          tooltip={s.overallTooltip}
          className={`relative h-10 w-10 text-${s.colorSlug}-500`}
        />
      </span>
      <h1 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-50">
        全体ステータス: {statusLabel[s.overallStatus]}
      </h1>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        最終更新: {formatDateTime(latestTimestamp)}
      </p>
      {s.formattedRemaining ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          次回更新まで: {s.formattedRemaining}
          {s.refreshHint ? `（${s.refreshHint}）` : ""}
        </p>
      ) : null}
    </div>
  );
}
