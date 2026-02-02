import { defineConfig } from "./plugins/envrc/schema";

const envrc = defineConfig({
  env: {
    ENVIRONMENT: {
      type: "text",
      required: false,
      description: "Node環境（development, production, test）",
      default: "development",
    },
    VITE_BACKEND_URL: {
      type: "url",
      required: true,
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
