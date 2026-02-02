import { defineConfig } from "./plugins/envrc/schema";

const envrc = defineConfig({
  env: {
    NODE_ENV: {
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
      required: false,
      masked: true,
      description: "外部APIの認証トークン",
    },
  },
});

export default envrc;
