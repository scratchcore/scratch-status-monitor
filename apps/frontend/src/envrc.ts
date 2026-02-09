import { defineConfig } from "./plugins/envrc/schema";

const envrc = defineConfig({
  env: {
    ENVIRONMENT: {
      type: "text",
      required: false,
      description: "Node環境（development, production, test）",
      default: "development",
    },
    VITE_SITE_BASE_URL: {
      type: "url",
      required: true,
      default: "http://localhost:3000",
      description: "サイトのベースURL",
    },
    VITE_BACKEND_URL: {
      type: "url",
      required: true,
      default: "http://localhost:8787",
      description: "バックエンドAPIのベースURL",
    },
    API_TOKEN: {
      type: "text",
      required: true,
      masked: true,
      description: "外部APIの認証トークン",
    },
  },
});

export default envrc;
