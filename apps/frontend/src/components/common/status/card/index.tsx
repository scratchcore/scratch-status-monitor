import { useContext } from "react";
import { formatDateTime, formatUptime } from "@/lib/status-page/data";
import { type colorMapping, statusLabel } from "@/lib/status-page/rc";
import { Tracker } from "../ui/tracker";
import { StatusCardContext } from "./context";
import { StatusIcon } from "../ui/icon";
import { StatusCardChart } from "./chart";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function StatusCard({
  monitorTooltip,
}: {
  monitorTooltip: keyof typeof colorMapping;
}) {
  const data = useContext(StatusCardContext);
  if (!data) return null;

  // トラッカーの開始と終了のラベルを取得
  const startLabel = data.data.desktop[0]?.date || "開始";
  const endLabel =
    data.data.desktop[data.data.desktop.length - 1]?.date || "現在";

  return (
    <div key={data.monitor.id} className="space-y-4">
      <div>
        <p className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
          <span className="flex items-center gap-2 font-medium">
            <StatusIcon tooltip={monitorTooltip} />
            <span className="text-gray-900 dark:text-gray-50">
              {data.monitor.label}
            </span>
          </span>
          <span className="text-gray-900 dark:text-gray-50">
            {formatUptime(data.uptimePercent)}% 稼働率
          </span>
        </p>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-500">
          <span>{statusLabel[data.monitor.status]}</span>
          <span>
            応答時間:{" "}
            {data.monitor.responseTime ? `${data.monitor.responseTime}ms` : "-"}
          </span>
          <span>最終チェック: {formatDateTime(data.monitor.recordedAt)}</span>
          {data.monitor.errorMessage ? (
            <span className="text-red-500">{data.monitor.errorMessage}</span>
          ) : null}
        </div>
        <Tracker
          hoverEffect
          data={data.data.desktop}
          className="mt-3 hidden w-full lg:flex"
        />
        <Tracker
          hoverEffect
          data={data.data.tablet}
          className="mt-3 hidden w-full sm:flex lg:hidden"
        />
        <Tracker
          hoverEffect
          data={data.data.mobile}
          className="mt-3 flex w-full sm:hidden"
        />
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>チャート</AccordionTrigger>
          <AccordionContent>
            <StatusCardChart />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div
        className="h-px w-full bg-gray-200 dark:bg-gray-800"
        aria-hidden={true}
      />
    </div>
  );
}
