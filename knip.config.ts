import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // --------------------------------------------------------------------------
  // Root workspace: repository-level configuration and standalone scripts.
  // Package/app source lives in their own workspaces below, matching the Bun
  // Workspaces layout (`apps/*`, `packages/*`).
  // --------------------------------------------------------------------------
  workspaces: {
    ".": {
      entry: ["scripts/**/*.ts"],
      project: ["scripts/**/*.ts", "*.ts"],
    },
    "apps/*": {
      project: "src/**/*.ts",
    },
    "packages/*": {
      project: "src/**/*.ts",
    },
  },

  // fast-check and Stryker Mutator are part of the standardized testing stack
  // (see TESTING.md) but are not imported anywhere yet, since there is no
  // domain logic to property-test or mutate in this foundation milestone.
  ignoreDependencies: ["fast-check"],

  // Ignore exports that are only used inside the same file.
  ignoreExportsUsedInFile: true,
};

export default config;
