import { type Dictionary, t } from "intlayer";

const statusContent = {
  key: "status",
  content: {
    // エラーメッセージ
    error: {
      title: t({
        ja: "エラーが発生しました",
        en: "An error occurred",
      }),
      unknown: t({
        ja: "不明なエラー",
        en: "Unknown error",
      }),
    },
    // 情報ヘッダー
    header: {
      overallStatus: t({
        ja: "全体ステータス",
        en: "Overall Status",
      }),
      lastUpdated: t({
        ja: "最終更新",
        en: "Last Updated",
      }),
      nextUpdate: t({
        ja: "次回更新",
        en: "Next Update",
      }),
    },
    // ステータスレベル
    statusLevel: {
      up: t({
        ja: "稼働中",
        en: "Operational",
      }),
      degraded: t({
        ja: "一部障害",
        en: "Degraded",
      }),
      down: t({
        ja: "停止",
        en: "Down",
      }),
      unknown: t({
        ja: "未計測",
        en: "Not Measured",
      }),
    },
    // モニターカード
    card: {
      uptime: t({
        ja: "稼働率",
        en: "Uptime",
      }),
      responseTime: t({
        ja: "応答時間",
        en: "Response Time",
      }),
      lastCheck: t({
        ja: "最終チェック",
        en: "Last Check",
      }),
      chart: t({
        ja: "チャート",
        en: "Chart",
      }),
      start: t({
        ja: "開始",
        en: "Start",
      }),
      current: t({
        ja: "現在",
        en: "Current",
      }),
      period: {
        today: t({
          ja: "今日",
          en: "Today",
        }),
        yesterday: t({
          ja: "昨日",
          en: "Yesterday",
        }),
        lastTwoDays: t({
          ja: "一昨日",
          en: "Last 2 Days",
        }),
        all: t({
          ja: "全期間",
          en: "All Time",
        }),
      },
    },
  },
} satisfies Dictionary;

export default statusContent;
