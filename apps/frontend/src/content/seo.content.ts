import { type Dictionary, t } from "intlayer";

const appContent = {
  key: "seo",
  content: {
    title: t({
      ja: "Scratchステータスモニター (SSM)",
      en: "Scratch Status Monitor (SSM)",
    }),
    title_short: t({
      ja: "Scratchステータスモニター",
      en: "Scratch Status Monitor",
    }),
    description: t({
      ja: "Scratch Status Monitor (SSM)は、Scratchサービスの稼働状況をリアルタイムで監視・表示するツールです。サービスの状態を一目で把握できます。Scratchの利用者や開発者にとって便利な情報を提供します。本プロジェクトはオープンソースであり、GitHubでソースコードを公開しています。Scratch Teamによる公式なサポート一切なく、非公式なツールであることに注意してください。",
      en: "Scratch Status Monitor (SSM) is a tool that monitors and displays the operational status of Scratch services in real-time. It provides an at-a-glance view of service status, offering useful information for Scratch users and developers. This project is open-source, with source code available on GitHub. Please note that it is an unofficial tool with no official support from the Scratch Team.",
    }),
    keywords: t({
      ja: "Scratch, ステータスモニター, サービスステータス, 監視ツール, オープンソース, Scratchプロジェクト, リアルタイムステータス, アップタイム, ダウンタイム, API, ScratchCore",
      en: "Scratch, Status Monitor, Service Status, Monitoring Tool, Open Source, Scratch Projects, Real-time Status, Uptime, Downtime, API, ScratchCore",
    }),
  },
} satisfies Dictionary;

export default appContent;
