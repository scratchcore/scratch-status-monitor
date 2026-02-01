import { colorMapping, type HistoryRecord, type StatusLevel, statusToTooltip } from "./rc";

/**
 * ステータス集約戦略
 * - worst: 1つでも downがあれば down（最も厳しい判定）
 * - latest: グループ内の最後のステータス（時系列で最新）
 * - majority: 最も割合を占めるステータス（多数決）
 */
type AggregationStrategy = "worst" | "latest" | "majority";

const DEFAULT_AGGREGATION_STRATEGY: AggregationStrategy = "worst";

export const generatePlaceholderTrackData = (count: number) => {
  // 7日間分のデータをmemoryCountで分割するので、全体を7日として計算
  const totalDays = 7;
  const dayPerMemory = totalDays / count;
  const now = new Date();

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now);
    // 7日前から今日までを等間隔で配置
    const daysAgo = Math.round(totalDays - (i + 1) * dayPerMemory);
    date.setDate(date.getDate() - daysAgo);
    return {
      date: date.toLocaleDateString("ja-JP", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      tooltip: "Not measured" as keyof typeof colorMapping,
      color: colorMapping["Not measured"],
    };
  });
};

/**
 * 複数のステータスを1つに集約する
 * @param statuses 集約対象のステータス配列
 * @param strategy 集約戦略（デフォルト: latest）
 */
export const aggregateStatus = (
  statuses: StatusLevel[],
  strategy: AggregationStrategy = DEFAULT_AGGREGATION_STRATEGY,
): StatusLevel => {
  if (statuses.length === 0) return "unknown";

  switch (strategy) {
    case "worst":
      // 最も悪い状態を優先: down > degraded > up > unknown
      if (statuses.includes("down")) return "down";
      if (statuses.includes("degraded")) return "degraded";
      if (statuses.every((s) => s === "up")) return "up";
      return "unknown";

    case "latest":
      // グループ内の最後（最新）のステータスを使用
      return statuses[statuses.length - 1];

    case "majority": {
      // 最も割合が大きいステータスを使用
      const counts = statuses.reduce(
        (acc, status) => {
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {} as Record<StatusLevel, number>,
      );
      const [mostFrequent] = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
      return mostFrequent as StatusLevel;
    }

    default:
      return "unknown";
  }
};

export const formatDateShort = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ja-JP", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const buildMemoryTrackData = (
  records: HistoryRecord[] | undefined,
  memoryCount: number,
  strategy: AggregationStrategy = DEFAULT_AGGREGATION_STRATEGY,
) => {
  if (!records || records.length === 0) {
    return generatePlaceholderTrackData(memoryCount);
  }

  const sorted = [...records].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  // レコードをmemoryCountのグループに分割
  const groupSize = Math.ceil(sorted.length / memoryCount);
  const groups: HistoryRecord[][] = [];

  for (let i = 0; i < memoryCount; i++) {
    const start = i * groupSize;
    const end = Math.min(start + groupSize, sorted.length);
    const group = sorted.slice(start, end);
    if (group.length > 0) {
      groups.push(group);
    }
  }

  // 各グループを1メモリに集約
  const mapped = groups.map((group) => {
    const statuses = group.map((r) => r.status);
    const aggregated = aggregateStatus(statuses, strategy);
    const tooltip = statusToTooltip[aggregated];
    // グループの日付は最新のレコードの日付を使用
    const lastRecord = group[group.length - 1];
    return {
      date: formatDateShort(lastRecord.recordedAt),
      tooltip,
      color: colorMapping[tooltip],
    };
  });

  // メモリ数に満たない場合は残りをfillで埋める
  if (mapped.length < memoryCount) {
    const missing = memoryCount - mapped.length;
    const filler = generatePlaceholderTrackData(missing);
    return [...filler, ...mapped];
  }

  return mapped;
};

export const formatDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};
