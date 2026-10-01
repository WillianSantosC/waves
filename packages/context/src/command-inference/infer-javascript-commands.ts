import type { PackageJsonManifest } from "../manifests/discover-manifests.ts";
import type { DiscoveredCommand, ProjectCommands } from "./project-commands.ts";

type PackageManager = "bun" | "yarn" | "pnpm" | "npm";

const LOCKFILE_BY_PACKAGE_MANAGER: Record<string, PackageManager> = {
  "bun.lock": "bun",
  "bun.lockb": "bun",
  "yarn.lock": "yarn",
  "pnpm-lock.yaml": "pnpm",
  "package-lock.json": "npm",
};

/**
 * Infers test/lint/typecheck/build commands from `package.json` scripts,
 * but only when the canonical script name is present — ambiguous candidates
 * (e.g. `test:unit`/`test:e2e` with no plain `test`) are left undefined
 * rather than guessed, per WV-25's determinism requirement.
 */
export function inferJavaScriptCommands(
  manifest: PackageJsonManifest,
  relativeFilePaths: string[],
): ProjectCommands {
  const packageManager = detectPackageManager(relativeFilePaths);

  const test = toDiscoveredCommand(manifest, "test", packageManager);
  const lint = toDiscoveredCommand(manifest, "lint", packageManager);
  const typecheck =
    toDiscoveredCommand(manifest, "typecheck", packageManager) ??
    toDiscoveredCommand(manifest, "type-check", packageManager);
  const build = toDiscoveredCommand(manifest, "build", packageManager);

  return {
    ...(test !== undefined ? { test } : {}),
    ...(lint !== undefined ? { lint } : {}),
    ...(typecheck !== undefined ? { typecheck } : {}),
    ...(build !== undefined ? { build } : {}),
  };
}

function toDiscoveredCommand(
  manifest: PackageJsonManifest,
  scriptName: string,
  packageManager: PackageManager,
): DiscoveredCommand | undefined {
  if (!(scriptName in manifest.scripts)) {
    return undefined;
  }

  return {
    command: `${packageManager} run ${scriptName}`,
    source: {
      type: "package-json-script",
      reference: `${manifest.path}#scripts.${scriptName}`,
    },
  };
}

function detectPackageManager(relativeFilePaths: string[]): PackageManager {
  for (const relativePath of relativeFilePaths) {
    const packageManager = LOCKFILE_BY_PACKAGE_MANAGER[relativePath];
    if (packageManager !== undefined) {
      return packageManager;
    }
  }
  return "npm";
}
