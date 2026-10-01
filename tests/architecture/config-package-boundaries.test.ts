import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PACKAGE_ROOT = path.resolve(import.meta.dirname, "../../packages/config/src");

const ALLOWED_IMPORT_PREFIXES = ["zod", "yaml", "node:", "@waves/core", ".", "@/"];

const FORBIDDEN_WORKSPACE_PACKAGES = [
  "@waves/context",
  "@waves/workspaces",
  "@waves/runtimes",
  "@waves/executors",
  "@waves/providers",
  "@waves/workflow",
  "@waves/state",
  "@waves/memory",
  "@waves/artifacts",
  "@waves/evidence",
  "@waves/review",
  "@waves/skills",
];

async function collectTsFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTsFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      files.push(entryPath);
    }
  }
  return files;
}

function extractImportSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  const importRegex = /(?:import|export)\s+(?:[^'"]*?from\s+)?["']([^"']+)["']/g;
  for (const match of source.matchAll(importRegex)) {
    const specifier = match[1];
    if (specifier !== undefined) {
      specifiers.push(specifier);
    }
  }
  return specifiers;
}

describe("@waves/config package boundaries", () => {
  it("only imports from zod, yaml, node:*, @waves/core, and relative paths", async () => {
    const files = await collectTsFiles(PACKAGE_ROOT);
    const violations: string[] = [];

    for (const file of files) {
      const source = await readFile(file, "utf8");
      const specifiers = extractImportSpecifiers(source);
      for (const specifier of specifiers) {
        const isAllowed = ALLOWED_IMPORT_PREFIXES.some((prefix) => specifier.startsWith(prefix));
        if (!isAllowed) {
          violations.push(`${path.relative(PACKAGE_ROOT, file)} imports "${specifier}"`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("never imports a workspace package that conceptually depends on config, not vice versa", async () => {
    const files = await collectTsFiles(PACKAGE_ROOT);
    const violations: string[] = [];

    for (const file of files) {
      const source = await readFile(file, "utf8");
      for (const forbidden of FORBIDDEN_WORKSPACE_PACKAGES) {
        if (source.includes(forbidden)) {
          violations.push(`${path.relative(PACKAGE_ROOT, file)} references "${forbidden}"`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
