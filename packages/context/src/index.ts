export const PACKAGE_NAME = "@waves/context";

export { discoverProject } from "./project-discovery/project-discovery.ts";
export { ProjectDiscoveryError } from "./project-discovery/project-discovery-error.ts";
export type {
  ProjectDiscoveryResult,
  RepositoryContext,
  ContextResource,
  ContextResourceKind,
} from "./project-discovery/project-discovery-result.ts";
export type {
  ProjectCommands,
  DiscoveredCommand,
  DiscoverySource,
} from "./command-inference/project-commands.ts";
