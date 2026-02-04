import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useContext, useMemo } from "react";
import { StatusCardContext } from "./context";
import { StatusCardChartTooltip } from "../ui/chart-tooltip";
import { ssmrc } from "@scratchcore/ssm-configs";

const chartConfig = {
  responseTime: {
    label: "responseTime",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function floorToInterval(date: Date, intervalMs: number): Date {
  const time = date.getTime();
  const floored = Math.floor(time / intervalMs) * intervalMs;
  return new Date(floored);
}

export function StatusCardChart() {
  const s = useContext(StatusCardContext);
  if (!s) return null;

  // チャートデータをメモ化（s.data.row が変わる時だけ再計算）
  const chartData = useMemo(() => {
    return s.data.row.map((record) => {
      const recordedAtDate = new Date(record.recordedAt);
      const bucketedAtDate = record.bucketedAt
        ? new Date(record.bucketedAt)
        : floorToInterval(recordedAtDate, ssmrc.cache.bucketIntervalMs);
      const isStartOfDay =
        bucketedAtDate.getHours() === 0 && bucketedAtDate.getMinutes() === 0;

      return {
        // Tooltip用フル日時
        fullDateTime: recordedAtDate.toLocaleDateString("ja-JP", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        // X軸用ラベル（日付のはじめなら日付、それ以外は時間）
        recordedAt: isStartOfDay
          ? bucketedAtDate.toLocaleDateString("ja-JP", {
              month: "2-digit",
              day: "2-digit",
            })
          : bucketedAtDate.toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            }),
        responseTime: record.responseTime,
      };
    });
  }, [s.data.row]);

  return (
    <ChartContainer config={chartConfig} className="flex flex-col w-full max-h-56">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="recordedAt"
          tickLine={false}
          axisLine={false}
          tickMargin={4}
        />
        <YAxis
          dataKey="responseTime"
          tickLine={false}
          axisLine={false}
          tickMargin={2}
        />
        <ChartTooltip
          cursor={false}
          content={
            <StatusCardChartTooltip
              valueFormatter={(value) => {
                if (typeof value === "number") {
                  return `${value}ms`;
                }
                return value;
              }}
              nameFormatter={(name) => {
                if (name === "responseTime") {
                  return "応答時間";
                }
                return name;
              }}
            />
          }
          labelFormatter={(value) => {
            const data = chartData.find((d) => d.recordedAt === value);
            return data?.fullDateTime || value;
          }}
        />
        <Area dataKey="responseTime" type="linear" fillOpacity={0.4} />
      </AreaChart>
    </ChartContainer>
  );
}
