import { stat } from "node:fs/promises";
import path from "node:path";
import {
  GitExecutableUnavailableError,
  resolveGitRepositoryRoot,
} from "@/git-repository-root/git-repository-root.ts";
import { WorkspaceResolutionError } from "./workspace-resolution-error.ts";
import type { WorkspaceContext } from "./workspace-context.ts";

export async function resolveWorkspaceContext(
  invocationDirectory: string,
): Promise<WorkspaceContext> {
  const normalizedInvocationDirectory = path.resolve(invocationDirectory);

  await ensureDirectoryExists(normalizedInvocationDirectory);

  let repositoryRoot: string | undefined;
  try {
    repositoryRoot = await resolveGitRepositoryRoot(normalizedInvocationDirectory);
  } catch (error) {
    if (error instanceof GitExecutableUnavailableError) {
      throw new WorkspaceResolutionError({
        code: "WORKSPACE_GIT_EXECUTABLE_UNAVAILABLE",
        message: `Failed to run "git" while resolving the workspace for "${normalizedInvocationDirectory}": ${error.spawnErrorCode}.`,
        retryable: false,
        details: {
          invocationDirectory: normalizedInvocationDirectory,
          spawnErrorCode: error.spawnErrorCode,
        },
      });
    }
    throw error;
  }

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

async function ensureDirectoryExists(directory: string): Promise<void> {
  try {
    const stats = await stat(directory);
    if (!stats.isDirectory()) {
      throw new WorkspaceResolutionError({
        code: "WORKSPACE_INVOCATION_DIRECTORY_NOT_FOUND",
        message: `"${directory}" is not a directory.`,
        retryable: false,
        details: { invocationDirectory: directory },
      });
    }
  } catch (error) {
    if (error instanceof WorkspaceResolutionError) {
      throw error;
    }
    throw new WorkspaceResolutionError({
      code: "WORKSPACE_INVOCATION_DIRECTORY_NOT_FOUND",
      message: `"${directory}" does not exist.`,
      retryable: false,
      details: { invocationDirectory: directory },
    });
  }
}
