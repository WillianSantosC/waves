import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // --------------------------------------------------------------------------
  // Root workspace: repository-level configuration and standalone scripts.
  // Package/app source lives in their own workspaces below, matching the Bun
  // Workspaces layout (`apps/*`, `packages/*`).
  // --------------------------------------------------------------------------
  workspaces: {
    ".": {
      entry: ["scripts/**/*.ts", "tests/**/*.test.ts"],
      project: ["scripts/**/*.ts", "tests/**/*.ts", "*.ts"],
    },
    "apps/*": {
      project: "src/**/*.ts",
    },
    "packages/*": {
      project: "src/**/*.ts",
    },
  },

  // Ignore exports that are only used inside the same file.
  ignoreExportsUsedInFile: true,
};

export default config;
