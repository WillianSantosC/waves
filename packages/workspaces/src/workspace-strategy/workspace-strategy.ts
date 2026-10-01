import type { Workspace, WorkspaceId } from "@waves/core";

export interface WorkspaceStrategy {
  id: string;

  prepare(request: WorkspacePreparationRequest): Promise<Workspace>;

  inspect(id: WorkspaceId): Promise<Workspace>;
  cleanup(id: WorkspaceId): Promise<void>;
}

export interface WorkspacePreparationRequest {
  repositoryRoot: string;

  baseRevision?: string;
  branch?: string;
  metadata?: Record<string, unknown>;
}
