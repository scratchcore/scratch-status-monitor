import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    passWithNoTests: true,
    testTimeout: 10000,
    coverage: {
      reporter: ["text", "lcov", "html"], // ← lcov が重要
      include: ["src"], // <- 対象ファイル
      exclude: ["**/test/**", "**/*.test.ts"], // 必要に応じて調整
      reportsDirectory: "./coverage",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
