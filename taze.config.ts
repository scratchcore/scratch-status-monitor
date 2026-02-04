import { defineConfig } from "taze";

export default defineConfig({
  // ignore packages from bumping
  exclude: ["webpack"],
  // fetch latest package info from registry without cache
  force: true,
  // write to package.json
  write: true,
  // ignore paths for looking for package.json in monorepo
  ignorePaths: ["**/node_modules/**", "**/test/**"],
  // ignore package.json that in other workspaces (with their own .git,pnpm-workspace.yaml,etc.)
  ignoreOtherWorkspaces: false,
  // override with different bumping mode for each package
  packageMode: {},
  // disable checking for "overrides" package.json field
  depFields: {
    overrides: false,
  },
});
