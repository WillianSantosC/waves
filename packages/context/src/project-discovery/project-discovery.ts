import { stat } from "node:fs/promises";
import path from "node:path";
import { discoverManifests } from "../manifests/discover-manifests.ts";
import { discoverSkillLocations } from "../skill-locations/discover-skill-locations.ts";
import { discoverInstructionSources } from "../instruction-sources/discover-instruction-sources.ts";
import { inferCommands } from "../command-inference/infer-commands.ts";
import { fingerprintFile } from "../fingerprint/fingerprint-file.ts";
import { scanRepository } from "../repository-scan/scan-repository.ts";
import { ProjectDiscoveryError } from "./project-discovery-error.ts";
import { resolveRepositoryRevision } from "./resolve-repository-revision.ts";
import type { ProjectDiscoveryResult } from "./project-discovery-result.ts";

/**
 * Deterministically inspects a repository and produces a
 * `ProjectDiscoveryResult`, without using an LLM. Calling this twice against
 * the same repository state yields an identical result (modulo
 * `discoveredAt`).
 */
export async function discoverProject(repositoryRoot: string): Promise<ProjectDiscoveryResult> {
  const normalizedRoot = path.resolve(repositoryRoot);
  await ensureDirectoryExists(normalizedRoot);

  const relativeFilePaths = await scanRepository(normalizedRoot);

  const resources = discoverInstructionSources(relativeFilePaths);
  const [skillLocations, manifests, revision] = await Promise.all([
    discoverSkillLocations(normalizedRoot),
    discoverManifests(normalizedRoot, relativeFilePaths),
    resolveRepositoryRevision(normalizedRoot),
  ]);

  const commands = inferCommands(manifests, relativeFilePaths);

  const fingerprintedPaths = [
    ...resources.map((resource) => resource.path),
    ...(manifests.packageJson !== undefined ? [manifests.packageJson.path] : []),
    ...(manifests.pyprojectTomlPath !== undefined ? [manifests.pyprojectTomlPath] : []),
    ...(manifests.cargoTomlPath !== undefined ? [manifests.cargoTomlPath] : []),
    ...(manifests.goModPath !== undefined ? [manifests.goModPath] : []),
    ...manifests.dockerfiles,
    ...manifests.ciWorkflows,
    // No comparator: default UTF-16 code unit sort is correct and
    // locale-independent for strings (see scan-repository.ts for why that
    // matters for determinism).
  ].sort();

  const sourceFingerprints: Record<string, string> = {};
  for (const relativePath of fingerprintedPaths) {
    sourceFingerprints[relativePath] = await fingerprintFile(
      path.join(normalizedRoot, relativePath),
    );
  }

  return {
    repository: {
      repositoryRoot: normalizedRoot,
      ...(revision !== undefined ? { revision } : {}),
    },
    resources,
    skillLocations,
    commands,
    sourceFingerprints,
    discoveredAt: new Date(),
  };
}

async function ensureDirectoryExists(directory: string): Promise<void> {
  try {
    const stats = await stat(directory);
    if (!stats.isDirectory()) {
      throw new ProjectDiscoveryError({
        code: "DISCOVERY_REPOSITORY_ROOT_NOT_FOUND",
        message: `"${directory}" is not a directory.`,
        retryable: false,
        details: { repositoryRoot: directory },
      });
    }
  } catch (error) {
    if (error instanceof ProjectDiscoveryError) {
      throw error;
    }
    throw new ProjectDiscoveryError({
      code: "DISCOVERY_REPOSITORY_ROOT_NOT_FOUND",
      message: `"${directory}" does not exist.`,
      retryable: false,
      details: { repositoryRoot: directory },
    });
  }
}
