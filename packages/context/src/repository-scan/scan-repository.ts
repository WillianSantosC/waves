import { readdir } from "node:fs/promises";
import path from "node:path";

/**
 * Directories never descended into: dependency/build output, VCS internals,
 * and language-specific caches. Pruned before recursion (not filtered after)
 * so scans stay fast and deterministic even in large repositories.
 */
const IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".turbo",
  "target",
  "vendor",
  ".venv",
  "__pycache__",
]);

/**
 * Recursively lists every file under `repositoryRoot`, returning paths
 * relative to it, sorted lexicographically. Directory read order is not
 * guaranteed by the OS, so callers rely on this sort for determinism.
 */
export async function scanRepository(repositoryRoot: string): Promise<string[]> {
  const files = await walk(repositoryRoot, "");
  // No comparator: the default UTF-16 code unit sort is already the right
  // order for strings, and it's locale-independent — unlike `localeCompare`,
  // it can't produce a different order on a different machine/CI runner,
  // which would break determinism across environments.
  return files.sort();
}

async function walk(absoluteDir: string, relativeDir: string): Promise<string[]> {
  const entries = await readdir(absoluteDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const relativePath = relativeDir === "" ? entry.name : path.join(relativeDir, entry.name);

    if (entry.isFile()) {
      files.push(relativePath);
      continue;
    }

    if (entry.isDirectory() && !IGNORED_DIRECTORIES.has(entry.name)) {
      const nested = await walk(path.join(absoluteDir, entry.name), relativePath);
      files.push(...nested);
    }
  }

  return files;
}
