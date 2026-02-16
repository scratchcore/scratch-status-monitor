import { type Dictionary, t } from "intlayer";

const footerContent = {
  key: "footer",
  content: {
    sections: {
      resources: t({
        ja: "リソース",
        en: "Resources",
        de: "Ressourcen",
        fr: "Ressources",
      }),
      details: t({
        ja: "詳細",
        en: "Details",
        de: "Details",
        fr: "Details",
      }),
      policies: t({
        ja: "ポリシー",
        en: "Policies",
        de: "Richtlinien",
        fr: "Politiques",
      }),
    },
    links: {
      monitor: t({
        ja: "モニター",
        en: "Monitor",
        de: "Monitor",
        fr: "Moniteur",
      }),
      about: t({
        ja: "概要",
        en: "About",
        de: "Über",
        fr: "À propos",
      }),
      usage: t({
        ja: "使い方",
        en: "Usage",
        de: "Verwendung",
        fr: "Utilisation",
      }),
      howItWorks: t({
        ja: "仕組み",
        en: "How It Works",
        de: "Funktionsweise",
        fr: "Comment ça marche",
      }),
      feedback: t({
        ja: "フィードバック",
        en: "Feedback",
        de: "Feedback",
        fr: "Retour d'information",
      }),
      team: t({
        ja: "チーム",
        en: "Team",
        de: "Team",
        fr: "Équipe",
      }),
      funding: t({
        ja: "運営とご支援について",
        en: "Funding",
        de: "Finanzierung",
        fr: "Financement",
      }),
      transparency: t({
        ja: "透明性",
        en: "Transparency",
        de: "Transparenz",
        fr: "Transparence",
      }),
      issues: t({
        ja: "問題",
        en: "Issues",
        de: "Probleme",
        fr: "Problèmes",
      }),
      discussions: t({
        ja: "議論",
        en: "Discussions",
        de: "Diskussionen",
        fr: "Discussions",
      }),
      repository: t({
        ja: "リポジトリ",
        en: "Repository",
        de: "Repository",
        fr: "Dépôt",
      }),
      privacyPolicy: t({
        ja: "プライバシー",
        en: "Privacy",
        de: "Datenschutz",
        fr: "Confidentialité",
      }),
      cookiePolicy: t({
        ja: "クッキー",
        en: "Cookies",
        de: "Cookies",
        fr: "Cookies",
      }),
      dataPolicy: t({
        ja: "データ",
        en: "Data",
        de: "Daten",
        fr: "Données",
      }),
      externalServicePolicy: t({
        ja: "外部サービス",
        en: "External Services",
        de: "Externe Dienste",
        fr: "Services externes",
      }),
      termsOfService: t({
        ja: "利用規約",
        en: "Terms of Service",
        de: "Nutzungsbedingungen",
        fr: "Conditions d'utilisation",
      }),
      disclaimer: t({
        ja: "免責事項",
        en: "Disclaimer",
        de: "Haftungsausschluss",
        fr: "Avertissement",
      }),
    },
  },
} satisfies Dictionary;

export default footerContent;
