import type { WorkspaceId } from "../identifiers/identifiers.ts";

export interface Workspace {
  id: WorkspaceId;
  repositoryRoot: string;
  path: string;
  strategy: string;

  baseRevision?: string;
  branch?: string;
  metadata?: Record<string, unknown>;
}
