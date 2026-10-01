import type { Workspace } from "@waves/core";
import type { WorkspacePreparationRequest, WorkspaceStrategy } from "@waves/workspaces";

/**
 * Minimal in-memory `WorkspaceStrategy` used to prove that `AgentRuntime`
 * and `AgentExecutor` can operate against any strategy's `Workspace` output
 * unchanged. Not a real `current`/`worktree` implementation.
 */
export function createFakeWorkspaceStrategy(id: string): WorkspaceStrategy {
  const workspaces = new Map<string, Workspace>();
  let nextId = 0;

  return {
    id,

    async prepare(request: WorkspacePreparationRequest): Promise<Workspace> {
      const workspace: Workspace = {
        id: `${id}-${nextId++}`,
        repositoryRoot: request.repositoryRoot,
        path: request.repositoryRoot,
        strategy: id,
        ...(request.baseRevision !== undefined ? { baseRevision: request.baseRevision } : {}),
        ...(request.branch !== undefined ? { branch: request.branch } : {}),
        ...(request.metadata !== undefined ? { metadata: request.metadata } : {}),
      };
      workspaces.set(workspace.id, workspace);
      return workspace;
    },

    async inspect(workspaceId: string): Promise<Workspace> {
      const workspace = workspaces.get(workspaceId);
      if (workspace === undefined) {
        throw new Error(`Unknown workspace: ${workspaceId}`);
      }
      return workspace;
    },

    async cleanup(workspaceId: string): Promise<void> {
      workspaces.delete(workspaceId);
    },
  };
}
