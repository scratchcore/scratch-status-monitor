import { type Dictionary, insert, t } from "intlayer";

const statusContent = {
  key: "status",
  content: {
    // エラーメッセージ
    error: {
      title: t({
        ja: "エラーが発生しました",
        en: "An error occurred",
        de: "Ein Fehler ist aufgetreten",
        fr: "Une erreur s'est produite",
      }),
      unknown: t({
        ja: "不明なエラー",
        en: "Unknown error",
        de: "Unbekannter Fehler",
        fr: "Erreur inconnue",
      }),
    },
    // 情報ヘッダー
    header: {
      overallStatus: t({
        ja: "全体ステータス",
        en: "Overall Status",
        de: "Gesamtstatus",
        fr: "Statut général",
      }),
      lastUpdated: t({
        ja: "最終更新",
        en: "Last Updated",
        de: "Zuletzt aktualisiert",
        fr: "Dernière mise à jour",
      }),
      nextUpdate: t({
        ja: "次回更新",
        en: "Next Update",
        de: "Nächste Aktualisierung",
        fr: "Prochaine mise à jour",
      }),
      refreshHint: t({
        ja: insert("{{time}}分毎に更新"),
        en: insert("Every {{time}} minutes"),
        de: insert("Alle {{time}} Minuten"),
        fr: insert("Toutes les {{time}} minutes"),
      }),
    },
    // ステータスレベル
    statusLevel: {
      up: t({
        ja: "稼働中",
        en: "Operational",
        de: "Betriebsbereit",
        fr: "Opérationnel",
      }),
      degraded: t({
        ja: "一部障害",
        en: "Degraded",
        de: "Beeinträchtigt",
        fr: "Dégradé",
      }),
      down: t({
        ja: "停止",
        en: "Down",
        de: "Ausfall",
        fr: "Arrêt",
      }),
      unknown: t({
        ja: "未計測",
        en: "Not Measured",
        de: "Nicht gemessen",
        fr: "Non mesuré",
      }),
    },
    // モニターカード
    card: {
      uptime: t({
        ja: "稼働率",
        en: "Uptime",
        de: "Verfügbarkeit",
        fr: "Disponibilité",
      }),
      responseTime: t({
        ja: "応答時間",
        en: "Response Time",
        de: "Reaktionszeit",
        fr: "Temps de réponse",
      }),
      lastCheck: t({
        ja: "最終チェック",
        en: "Last Check",
        de: "Letzte Prüfung",
        fr: "Dernier contrôle",
      }),
      chart: t({
        ja: "チャート",
        en: "Chart",
        de: "Diagramm",
        fr: "Graphique",
      }),
      start: t({
        ja: "開始",
        en: "Start",
        de: "Start",
        fr: "Début",
      }),
      current: t({
        ja: "現在",
        en: "Current",
        de: "Aktuell",
        fr: "Actuel",
      }),
      period: {
        today: t({
          ja: "今日",
          en: "Today",
          de: "Heute",
          fr: "Aujourd'hui",
        }),
        yesterday: t({
          ja: "昨日",
          en: "Yesterday",
          de: "Gestern",
          fr: "Hier",
        }),
        lastTwoDays: t({
          ja: "一昨日",
          en: "Last 2 Days",
          de: "Letzte 2 Tage",
          fr: "Derniers 2 jours",
        }),
        all: t({
          ja: "全期間",
          en: "All Time",
          de: "Gesamtzeitraum",
          fr: "Tous les temps",
        }),
      },
    },
  },
} satisfies Dictionary;

export default statusContent;
