import path from "node:path";
import type {
  ContextResource,
  ContextResourceKind,
} from "../project-discovery/project-discovery-result.ts";

const INSTRUCTION_FILENAMES = new Set(["AGENTS.md", "CLAUDE.md", "CONTEXT.md"]);

/**
 * Classifies repository files (already discovered by `scanRepository`) into
 * the instruction/documentation/architecture/ADR resources described by
 * docs/architecture/architecture-v0.1.md §8. Supports nested occurrences
 * (e.g. a package-level AGENTS.md), not just repository-root files.
 */
export function discoverInstructionSources(relativeFilePaths: string[]): ContextResource[] {
  const resources: ContextResource[] = [];

  for (const relativePath of relativeFilePaths) {
    const kind = classify(relativePath);
    if (kind !== undefined) {
      resources.push({ path: relativePath, kind });
    }
  }

  return resources;
}

function classify(relativePath: string): ContextResourceKind | undefined {
  const segments = relativePath.split(path.sep);
  const filename = segments[segments.length - 1] ?? "";

  if (INSTRUCTION_FILENAMES.has(filename)) {
    return "instruction";
  }

  if (relativePath === path.join(".github", "copilot-instructions.md")) {
    return "instruction";
  }

  if (segments.includes(".cursor") && segments.includes("rules")) {
    return "instruction";
  }

  if (segments.some((segment) => segment.toLowerCase() === "adr")) {
    return "adr";
  }

  if (segments.some((segment) => segment.toLowerCase() === "architecture")) {
    return "architecture";
  }

  if (/^README(\.[a-zA-Z0-9]+)?$/.test(filename)) {
    return "documentation";
  }

  if (segments.includes("docs")) {
    return "documentation";
  }

  return undefined;
}
