import { defineConfig } from "./plugins/envrc/schema";

const envrc = defineConfig({
  env: {
    VITE_BACKEND_URL: {
      type: "url",
      required: true,
      description: "バックエンドAPIのベースURL",
    },
    NODE_ENV: {
      type: "text",
      required: false,
      description: "Node環境（development, production, test）",
      default: "development",
    },
  },
});

export default envrc;
