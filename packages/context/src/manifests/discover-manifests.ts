import { readFile } from "node:fs/promises";
import path from "node:path";

export interface PackageJsonManifest {
  path: string;
  scripts: Record<string, string>;
}

export interface ManifestDiscovery {
  packageJson?: PackageJsonManifest;
  pyprojectTomlPath?: string;
  cargoTomlPath?: string;
  goModPath?: string;
  dockerfiles: string[];
  ciWorkflows: string[];
}

const DOCKERFILE_PATTERN = /(^|\/)Dockerfile(\.[^/]+)?$/;
const CI_WORKFLOW_PATTERN = /^\.github\/workflows\/.+\.ya?ml$/;

/**
 * Discovers manifests and infrastructure metadata from an already-scanned
 * file list. Only `package.json` content is parsed (to read `scripts` for
 * command inference); other manifests are reported by presence only — safe
 * parsing of their formats is deferred until a concrete need exists.
 */
export async function discoverManifests(
  repositoryRoot: string,
  relativeFilePaths: string[],
): Promise<ManifestDiscovery> {
  const normalizedPaths = normalizePaths(relativeFilePaths);

  const packageJsonPath = findExact(normalizedPaths, "package.json");
  const packageJson =
    packageJsonPath !== undefined
      ? await readPackageJsonManifest(repositoryRoot, packageJsonPath)
      : undefined;

  return {
    ...(packageJson !== undefined ? { packageJson } : {}),
    ...optionalPath("pyprojectTomlPath", findExact(normalizedPaths, "pyproject.toml")),
    ...optionalPath("cargoTomlPath", findExact(normalizedPaths, "Cargo.toml")),
    ...optionalPath("goModPath", findExact(normalizedPaths, "go.mod")),
    // No comparator on either `.sort()`: default UTF-16 code unit sort is
    // correct and locale-independent for strings (see scan-repository.ts
    // for why that matters for determinism).
    dockerfiles: normalizedPaths
      .filter((relativePath) => DOCKERFILE_PATTERN.test(relativePath))
      .sort(),
    ciWorkflows: normalizedPaths
      .filter((relativePath) => CI_WORKFLOW_PATTERN.test(relativePath))
      .sort(),
  };
}

function normalizePaths(relativeFilePaths: string[]): string[] {
  return relativeFilePaths.map((relativePath) => relativePath.split(path.sep).join("/"));
}

function findExact(paths: string[], target: string): string | undefined {
  return paths.find((relativePath) => relativePath === target);
}

function optionalPath<TKey extends string>(
  key: TKey,
  value: string | undefined,
): Partial<Record<TKey, string>> {
  return value !== undefined ? ({ [key]: value } as Record<TKey, string>) : {};
}

async function readPackageJsonManifest(
  repositoryRoot: string,
  relativePath: string,
): Promise<PackageJsonManifest | undefined> {
  try {
    const content = await readFile(path.join(repositoryRoot, relativePath), "utf-8");
    const parsed: unknown = JSON.parse(content);
    const scripts =
      typeof parsed === "object" && parsed !== null && "scripts" in parsed
        ? (parsed as { scripts?: unknown }).scripts
        : undefined;

    return {
      path: relativePath,
      scripts: isStringRecord(scripts) ? scripts : {},
    };
  } catch {
    return undefined;
  }
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every((entry) => typeof entry === "string");
}
