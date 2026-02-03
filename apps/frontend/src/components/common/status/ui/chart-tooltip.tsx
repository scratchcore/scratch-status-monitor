import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

/**
 * カスタムチャートツールチップコンテンツ
 * より細かいカスタマイズが可能なバージョン
 */

interface CustomChartTooltipContentProps
  extends Omit<React.ComponentProps<typeof RechartsPrimitive.Tooltip>, "content" | "children">,
    Omit<React.ComponentProps<"div">, "color"> {
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  /**
   * 値のカスタムフォーマッター
   * @param value - 元の値
   * @param dataKey - データキー
   * @param payload - ペイロード全体
   * @returns フォーマット済み値
   */
  valueFormatter?: (value: number | string, dataKey: string, payload: any) => React.ReactNode;
  /**
   * 名前のカスタムフォーマッター
   * @param name - 元の名前
   * @param dataKey - データキー
   * @returns フォーマット済み名前
   */
  nameFormatter?: (name: string, dataKey: string) => React.ReactNode;
  /**
   * ラベルのカスタムフォーマッター
   * @param label - ラベル値
   * @param payload - ペイロード配列
   * @returns フォーマット済みラベル
   */
  customLabelFormatter?: (label: any, payload: any[]) => React.ReactNode;
}

export function StatusCardChartTooltip({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  nameKey,
  valueFormatter,
  nameFormatter,
  customLabelFormatter,
}: CustomChartTooltipContentProps) {
  // ラベルをメモ化して不要な再描画を防ぐ
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    // カスタムラベルフォーマッターがあればそれを使用
    if (customLabelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {customLabelFormatter(label, payload)}
        </div>
      );
    }

    // 通常のラベルフォーマッター
    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(label, payload)}
        </div>
      );
    }

    return null;
  }, [label, labelFormatter, customLabelFormatter, payload, hideLabel, labelClassName]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const dataKey = nameKey || item.name || item.dataKey || "value";
            const indicatorColor = item.payload.fill || item.color;

            // 値のフォーマット
            let formattedValue: React.ReactNode = item.value;
            if (valueFormatter && item.value !== undefined) {
              formattedValue = valueFormatter(item.value as number | string, dataKey as string, item.payload);
            } else if (formatter && item?.value !== undefined && item.name) {
              formattedValue = formatter(item.value as any, item.name as any, item, index, item.payload) as React.ReactNode;
            } else if (typeof item.value === "number") {
              formattedValue = item.value.toLocaleString();
            }

            // 名前のフォーマット
            let formattedName: React.ReactNode = item.name || dataKey;
            if (nameFormatter) {
              formattedName = nameFormatter(formattedName as string, dataKey as string);
            }

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                  indicator === "dot" && "items-center",
                )}
              >
                {!hideIndicator && (
                  <div
                    className={cn(
                      "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                      {
                        "h-2.5 w-2.5": indicator === "dot",
                        "w-1": indicator === "line",
                        "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                        "my-0.5": nestLabel && indicator === "dashed",
                      },
                    )}
                    style={
                      {
                        "--color-bg": indicatorColor,
                        "--color-border": indicatorColor,
                      } as React.CSSProperties
                    }
                  />
                )}
                <div
                  className={cn(
                    "flex flex-1 justify-between leading-none",
                    nestLabel ? "items-end" : "items-center",
                  )}
                >
                  <div className="grid gap-1.5">
                    {nestLabel ? tooltipLabel : null}
                    <span className="text-muted-foreground">{formattedName}</span>
                  </div>
                  {formattedValue !== undefined && (
                    <span className="text-foreground font-mono font-medium tabular-nums">
                      {formattedValue}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
