import { type Dictionary, t } from "intlayer";

const appContent = {
  key: "seo",
  content: {
    title: t({
      ja: "Scratch Status Monitor (SSM)",
      en: "Scratch Status Monitor (SSM)",
      de: "Scratch Status Monitor (SSM)",
      fr: "Scratch Status Monitor (SSM)",
    }),
    title_short: t({
      ja: "Scratch Status Monitor",
      en: "Scratch Status Monitor",
      de: "Scratch Status Monitor",
      fr: "Scratch Status Monitor",
    }),
    description: t({
      ja: "Scratchステータスモニター (SSM)は、Scratchサービスの稼働状況をリアルタイムで監視・表示するツールです。サービスの状態を一目で把握できます。Scratchの利用者や開発者にとって便利な情報を提供します。本プロジェクトはオープンソースであり、GitHubでソースコードを公開しています。Scratch Teamによる公式なサポート一切なく、非公式なツールであることに注意してください。",
      en: "Scratch Status Monitor (SSM) is a tool that monitors and displays the operational status of Scratch services in real-time. It provides an at-a-glance view of service status, offering useful information for Scratch users and developers. This project is open-source, with source code available on GitHub. Please note that it is an unofficial tool with no official support from the Scratch Team.",
      de: "Der Scratch Status Monitor (SSM) ist ein Tool, das den Betriebsstatus der Scratch-Dienste in Echtzeit überwacht und anzeigt. Es bietet einen Überblick über den Dienststatus und liefert nützliche Informationen für Scratch-Benutzer und Entwickler. Dieses Projekt ist Open Source, mit Quellcode auf GitHub verfügbar. Bitte beachten Sie, dass es sich um ein inoffizielles Tool handelt, das keine offizielle Unterstützung durch das Scratch-Team erhält.",
      fr: "Le Scratch Status Monitor (SSM) est un outil qui surveille et affiche le statut opérationnel des services Scratch en temps réel. Il offre une vue d'ensemble du statut des services, fournissant des informations utiles pour les utilisateurs et les développeurs de Scratch. Ce projet est open-source, avec le code source disponible sur GitHub. Veuillez noter qu'il s'agit d'un outil non officiel sans support officiel de la part de l'équipe Scratch.",
    }),
    keywords: t({
      ja: "Scratch, ステータスモニター, サービスステータス, 監視ツール, オープンソース, Scratchプロジェクト, リアルタイムステータス, アップタイム, ダウンタイム, API, ScratchCore",
      en: "Scratch, Status Monitor, Service Status, Monitoring Tool, Open Source, Scratch Projects, Real-time Status, Uptime, Downtime, API, ScratchCore",
      de: "Scratch, Statusmonitor, Dienststatus, Überwachungstool, Open Source, Scratch-Projekte, Echtzeit-Status, Betriebszeit, Ausfallzeit, API, ScratchCore",
      fr: "Scratch, Moniteur de statut, Statut du service, Outil de surveillance, Open Source, Projets Scratch, Statut en temps réel, Disponibilité, Indisponibilité, API, ScratchCore",
    }),
  },
} satisfies Dictionary;

export default appContent;
