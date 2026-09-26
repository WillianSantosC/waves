import path from "node:path";
import { resolveGitRepositoryRoot } from "@/git-repository-root/git-repository-root.ts";
import { WorkspaceResolutionError } from "./workspace-resolution-error.ts";
import type { WorkspaceContext } from "./workspace-context.ts";

export async function resolveWorkspaceContext(
  invocationDirectory: string,
): Promise<WorkspaceContext> {
  const normalizedInvocationDirectory = path.resolve(invocationDirectory);
  const repositoryRoot = await resolveGitRepositoryRoot(normalizedInvocationDirectory);

  if (repositoryRoot === undefined) {
    throw new WorkspaceResolutionError({
      code: "WORKSPACE_NOT_A_GIT_REPOSITORY",
      message: `"${normalizedInvocationDirectory}" is not inside a Git repository.`,
      retryable: false,
      details: { invocationDirectory: normalizedInvocationDirectory },
    });
  }

  return {
    invocationDirectory: normalizedInvocationDirectory,
    repositoryRoot,
  };
}
