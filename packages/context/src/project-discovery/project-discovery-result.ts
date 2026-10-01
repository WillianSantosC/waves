import type { ProjectCommands } from "../command-inference/project-commands.ts";

export interface ProjectDiscoveryResult {
  repository: RepositoryContext;
  resources: ContextResource[];
  skillLocations: string[];
  commands: ProjectCommands;
  sourceFingerprints: Record<string, string>;
  discoveredAt: Date;
}

export interface RepositoryContext {
  repositoryRoot: string;
  revision?: string;
}

export type ContextResourceKind = "instruction" | "documentation" | "architecture" | "adr";

export interface ContextResource {
  path: string;
  kind: ContextResourceKind;
}
