import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // --------------------------------------------------------------------------
  // Entry points
  //
  // Knip builds its dependency graph starting from these files.
  // Everything not reachable from an entry point is considered potentially
  // unused.
  //
  // Next.js relies heavily on file-system conventions instead of imports,
  // therefore App Router files must be declared explicitly to avoid
  // false positives.
  // --------------------------------------------------------------------------
  entry: [
    // Next.js App Router
    "app/**/page.tsx",
    "app/**/layout.tsx",
    "app/**/loading.tsx",
    "app/**/error.tsx",
    "app/**/not-found.tsx",
    "app/**/template.tsx",
    "app/**/default.tsx",
    "app/**/route.ts",

    // Next.js runtime files
    "proxy.ts",
    "middleware.ts",
    "instrumentation.ts",
    "instrumentation-client.ts",

    // Configuration
    "next.config.ts",
    "tailwind.config.ts",
    "postcss.config.ts",
    "vitest.config.ts",
    "vitest.unit.config.ts",
    "vitest.storybook.config.ts",
    "vitest.integration.config.mts",
    "playwright.config.ts",
    "drizzle.config.ts",
    "knip.config.ts",

    // Storybook
    ".storybook/**/*.{ts,tsx}",

    // Tests & Stories
    "app/**/*.test.{ts,tsx}",
    "app/**/*.stories.{ts,tsx}",
    "app/tests/**/*.spec.{ts,tsx}",
  ],

  // --------------------------------------------------------------------------
  // Source files to analyze.
  // --------------------------------------------------------------------------
  project: ["app/**/*.{ts,tsx}", "*.ts", "*.mts"],

  // --------------------------------------------------------------------------
  // Ignore paths
  //
  // These files are intentionally ignored because they are either generated,
  // consumed dynamically, or cannot be statically analyzed reliably.
  // --------------------------------------------------------------------------
  ignore: [
    // Next.js build output
    ".next/**",

    // Test coverage reports
    "coverage/**",

    // Generated database migrations
    "app/shared/lib/db/migrations/**",

    // Generated declaration files
    "**/*.d.ts",

    // Generated source files
    "**/*.generated.ts",
    "**/*.generated.tsx",
    "**/*.generated.css",
    "**/*.gen.ts",

    // Global declaration merging
    "global.d.ts",
  ],

  // --------------------------------------------------------------------------
  // Ignore intentionally exported public APIs.
  // Populate this list only when real false positives appear.
  // --------------------------------------------------------------------------
  ignoreBinaries: [],

  // Ignore exports that are only used inside the same file.
  ignoreExportsUsedInFile: true,
};

export default config;
