import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { StatusPageContext } from "../layout/context";
import { useContext, useMemo } from "react";
import { StatusCardContext } from "./context";
import { StatusCardChartTooltip } from "../ui/chart-tooltip";

const chartConfig = {
  responseTime: {
    label: "responseTime",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function StatusCardChart() {
  const s = useContext(StatusCardContext);
  if (!s) return null;

  // チャートデータをメモ化（s.data.row が変わる時だけ再計算）
  const chartData = useMemo(() => {
    return s.data.row.map((record) => {
      const date = new Date(record.recordedAt);
      const isStartOfDay = date.getHours() === 0 && date.getMinutes() === 0;

      return {
        // Tooltip用フル日時
        fullDateTime: date.toLocaleDateString("ja-JP", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        // X軸用ラベル（日付のはじめなら日付、それ以外は時間）
        recordedAt: isStartOfDay
          ? date.toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit" })
          : date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
        responseTime: record.responseTime,
      };
    });
  }, [s.data.row]);

  return (
    <ChartContainer config={chartConfig}>
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
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={
            <StatusCardChartTooltip
              indicator="dot"
              valueFormatter={(value) => {
                if (typeof value === "number") {
                  return `${value.toFixed(2)}ms`;
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
