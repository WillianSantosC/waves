import type { ManifestDiscovery } from "../manifests/discover-manifests.ts";
import { inferCargoCommands } from "./infer-cargo-commands.ts";
import { inferGoCommands } from "./infer-go-commands.ts";
import { inferJavaScriptCommands } from "./infer-javascript-commands.ts";
import type { ProjectCommands } from "./project-commands.ts";

/**
 * Dispatches to the ecosystem-specific inferer for the manifest(s) found.
 * A repository is expected to belong to one primary ecosystem at the root
 * level; when more than one manifest is present, JavaScript/TypeScript
 * takes precedence since Waves itself and most polyglot repos treat it as
 * the orchestration layer.
 */
export function inferCommands(
  manifests: ManifestDiscovery,
  relativeFilePaths: string[],
): ProjectCommands {
  if (manifests.packageJson !== undefined) {
    return inferJavaScriptCommands(manifests.packageJson, relativeFilePaths);
  }

  if (manifests.cargoTomlPath !== undefined) {
    return inferCargoCommands(manifests.cargoTomlPath);
  }

  if (manifests.goModPath !== undefined) {
    return inferGoCommands(manifests.goModPath);
  }

  return {};
}
