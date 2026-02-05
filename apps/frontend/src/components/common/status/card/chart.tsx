import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  ComposedChart,
} from "recharts";
import { useContext, useMemo } from "react";
import { StatusCardContext } from "./context";
import { StatusCardChartTooltip } from "../ui/chart-tooltip";
import { ssmrc } from "@scratchcore/ssm-configs";

const chartConfig = {
  responseTime: {
    label: "応答時間",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

/**
 * 時刻を指定の間隔でフロア処理
 */
function floorToInterval(date: Date, intervalMs: number): Date {
  const time = date.getTime();
  const floored = Math.floor(time / intervalMs) * intervalMs;
  return new Date(floored);
}

/**
 * 日時をフォーマット（フル形式）
 */
function formatFullDateTime(date: Date): string {
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * X軸用のラベルをフォーマット
 */
function formatXAxisLabel(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isStartOfDay = hours === 0 && minutes === 0;

  if (isStartOfDay) {
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "2-digit",
    });
  }

  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StatusCardChart() {
  const s = useContext(StatusCardContext);
  if (!s) return null;

  // チャートデータをメモ化（s.data.row が変わる時だけ再計算）
  const { chartData, dateChangeTimestamps } = useMemo(() => {
    if (!s.data.row || s.data.row.length === 0) {
      return { chartData: [], dateChangeTimestamps: [] };
    }

    // bucketIntervalMs 単位で集約して重複や順序の問題を解消
    const bucketMap = new Map<
      number,
      {
        sum: number;
        count: number;
        latestTimestamp: number;
      }
    >();

    for (const record of s.data.row) {
      const recordedAtDate = new Date(record.recordedAt);
      const bucketedAtDate = record.bucketedAt
        ? new Date(record.bucketedAt)
        : floorToInterval(recordedAtDate, ssmrc.cache.bucketIntervalMs);
      const bucketTimestamp = bucketedAtDate.getTime();
      const recordTimestamp = recordedAtDate.getTime();

      const existing = bucketMap.get(bucketTimestamp);
      if (existing) {
        existing.sum += record.responseTime;
        existing.count += 1;
        if (recordTimestamp > existing.latestTimestamp) {
          existing.latestTimestamp = recordTimestamp;
        }
      } else {
        bucketMap.set(bucketTimestamp, {
          sum: record.responseTime,
          count: 1,
          latestTimestamp: recordTimestamp,
        });
      }
    }

    const data = Array.from(bucketMap.entries())
      .map(([bucketTimestamp, bucket]) => {
        const bucketDate = new Date(bucketTimestamp);
        const latestDate = new Date(bucket.latestTimestamp);

        return {
          // ツールチップ用フル日時（バケット内の最新レコード）
          fullDateTime: formatFullDateTime(latestDate),
          // 時間軸（数値）- X軸のdataKeyとして使用
          timestamp: bucketTimestamp,
          // 応答時間（平均）
          responseTime: Math.round(bucket.sum / bucket.count),
          // X軸用ラベル（時間軸での表示）
          xAxisLabel: formatXAxisLabel(bucketDate),
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    // 日付が変わる箇所を検出
    const dateChanges: number[] = [];
    for (let i = 1; i < data.length; i++) {
      const prevDate = new Date(data[i - 1].timestamp);
      const currDate = new Date(data[i].timestamp);

      if (
        prevDate.getFullYear() !== currDate.getFullYear() ||
        prevDate.getMonth() !== currDate.getMonth() ||
        prevDate.getDate() !== currDate.getDate()
      ) {
        dateChanges.push(data[i].timestamp);
      }
    }

    return {
      chartData: data,
      dateChangeTimestamps: dateChanges,
    };
  }, [s.data.row]);

  // チャートが表示できるデータがあるかチェック
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-gray-500 dark:text-gray-400">
        チャートデータがありません
      </div>
    );
  }

  const minTimestamp = Math.min(...chartData.map((d) => d.timestamp));
  const maxTimestamp = Math.max(...chartData.map((d) => d.timestamp));

  return (
    <ChartContainer config={chartConfig} className="w-full h-56">
      <ComposedChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 0, right: 0, top: 12, bottom: 0 }}
      >
        <CartesianGrid
          vertical={true}
          strokeDasharray="3 3"
          stroke="hsl(var(--border) / 0.3)"
        />

        {/* 日付が変わる箇所に縦線を表示 */}
        {dateChangeTimestamps.map((timestamp, idx) => (
          <ReferenceLine
            key={`date-change-${idx}`}
            x={timestamp}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: new Date(timestamp).toLocaleDateString("ja-JP", {
                month: "short",
                day: "2-digit",
              }),
              position: "insideTopRight",
              offset: -8,
              fill: "hsl(var(--muted-foreground))",
              fontSize: 12,
              fontWeight: 600,
            }}
          />
        ))}

        <XAxis
          dataKey="timestamp"
          type="number"
          domain={[minTimestamp, maxTimestamp]}
          tickFormatter={(timestamp) => {
            const date = new Date(timestamp);
            return date.toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            });
          }}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          stroke="currentColor"
          style={{ fontSize: "0.75rem" }}
          // X軸の目盛りを5個程度表示
          ticks={Array.from(
            { length: 5 },
            (_, i) => minTimestamp + ((maxTimestamp - minTimestamp) * i) / 4,
          )}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          stroke="currentColor"
          style={{ fontSize: "0.75rem" }}
          label={{ value: "応答時間 (ms)", angle: -90, position: "insideLeft" }}
        />
        <ChartTooltip
          cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          content={
            <StatusCardChartTooltip
              valueFormatter={(value) => {
                if (typeof value === "number") {
                  return `${Math.round(value)}ms`;
                }
                return String(value);
              }}
              nameFormatter={(name) => {
                return (
                  chartConfig[name as keyof typeof chartConfig]?.label || name
                );
              }}
            />
          }
          labelFormatter={(value) => {
            const data = chartData.find((d) => d.timestamp === value);
            return data?.fullDateTime || String(value);
          }}
        />
        <Area
          dataKey="responseTime"
          type="monotone"
          // stroke="hsl(var(--chart-1))"
          // fill="hsl(var(--chart-1))"
          fillOpacity={0.2}
          isAnimationActive={false}
          dot={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
