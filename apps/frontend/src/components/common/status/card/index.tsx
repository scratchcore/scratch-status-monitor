import { useContext } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import {
  formatDateTime,
  formatUptime,
  formatDateShort,
} from "@/lib/status-page/data";
import { type colorMapping } from "@/lib/status-page/rc";
import { Tracker } from "../ui/tracker";
import { StatusCardContext } from "./context";
import { StatusIcon } from "../ui/icon";
import { StatusCardChart } from "./chart";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export function StatusCard({
  monitorTooltip,
}: {
  monitorTooltip?: keyof typeof colorMapping;
}) {
  const data = useContext(StatusCardContext);
  const t = useIntlayer("status");
  const { locale } = useLocale();
  if (!data) return null;

  // トラッカーの開始と終了のラベルを取得
  const desktopData = data.data?.desktop;
  const startDate = desktopData?.[0]?.date;
  const endDate = desktopData?.[desktopData.length - 1]?.date;
  const startLabel = startDate
    ? formatDateShort(startDate, locale)
    : t.card.start;
  const endLabel = endDate ? formatDateShort(endDate, locale) : t.card.current;

  return (
    <div key={data.monitor.id} className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
          <span className="flex items-center gap-2 font-medium">
            <StatusIcon tooltip={monitorTooltip ?? "Not measured"} />
            <span className="text-primary">{data.monitor.label}</span>
          </span>
          {data.uptimePercent !== undefined ? (
            <span className="text-primary">
              {formatUptime(data.uptimePercent)}% {t.card.uptime}
            </span>
          ) : (
            <Skeleton className="inline-block h-5 w-24" />
          )}
        </div>
        {data.data ? (
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              {data.monitor.status ? t.statusLevel[data.monitor.status] : "-"}
            </span>
            <span>
              {t.card.responseTime}:{" "}
              {data.monitor.responseTime
                ? `${data.monitor.responseTime}ms`
                : "-"}
            </span>
            <span>
              {t.card.lastCheck}:{" "}
              {data.monitor.recordedAt
                ? formatDateTime(data.monitor.recordedAt, locale)
                : "-"}
            </span>
            {data.monitor.errorMessage ? (
              <span className="text-red-500">{data.monitor.errorMessage}</span>
            ) : null}
          </div>
        ) : (
          <div className="mt-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        )}
        {data.data ? (
          <>
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
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>{startLabel}</span>
              <span>{endLabel}</span>
            </div>
          </>
        ) : (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={i} className="h-1 flex-1" />
              ))}
            </div>
            <div className="flex items-center justify-between text-sm">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        )}
      </div>
      {data.data ? (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>{t.card.chart}</AccordionTrigger>
            <AccordionContent>
              <StatusCardChart />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <Skeleton className="h-10 w-full rounded" />
      )}
      <Separator />
    </div>
  );
}
