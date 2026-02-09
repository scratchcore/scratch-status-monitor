import { type Dictionary, t } from "intlayer";

const footerContent = {
  key: "footer",
  content: {
    sections: {
      resources: t({
        ja: "リソース",
        en: "Resources",
      }),
      details: t({
        ja: "詳細",
        en: "Details",
      }),
      policies: t({
        ja: "ポリシー",
        en: "Policies",
      }),
    },
    links: {
      monitor: t({
        ja: "モニター",
        en: "Monitor",
      }),
      about: t({
        ja: "概要",
        en: "About",
      }),
      usage: t({
        ja: "使い方",
        en: "Usage",
      }),
      howItWorks: t({
        ja: "仕組み",
        en: "How It Works",
      }),
      team: t({
        ja: "チーム",
        en: "Team",
      }),
      issues: t({
        ja: "問題",
        en: "Issues",
      }),
      discussions: t({
        ja: "議論",
        en: "Discussions",
      }),
      repository: t({
        ja: "リポジトリ",
        en: "Repository",
      }),
      privacyPolicy: t({
        ja: "プライバシーポリシー",
        en: "Privacy Policy",
      }),
      cookiePolicy: t({
        ja: "クッキーポリシー",
        en: "Cookie Policy",
      }),
      dataPolicy: t({
        ja: "データポリシー",
        en: "Data Policy",
      }),
      externalServicePolicy: t({
        ja: "外部サービス利用ポリシー",
        en: "External Service Policy",
      }),
      termsOfService: t({
        ja: "利用規約",
        en: "Terms of Service",
      }),
      disclaimer: t({
        ja: "免責事項",
        en: "Disclaimer",
      }),
    },
  },
} satisfies Dictionary;

export default footerContent;
