import path from "node:path";
import { runCommand } from "@/command-runner/command-runner.ts";

/**
 * Thrown when the `git` executable could not be run at all (missing from
 * PATH, permission denied, etc.), as opposed to `git` running and reporting
 * that the directory is not a repository. Callers decide how to surface this
 * (e.g. map it to a domain-specific error code).
 */
export class GitExecutableUnavailableError extends Error {
  readonly spawnErrorCode: string;

  constructor(spawnErrorCode: string) {
    super(`Failed to run "git": ${spawnErrorCode}.`);
    this.name = "GitExecutableUnavailableError";
    this.spawnErrorCode = spawnErrorCode;
  }
}

export async function resolveGitRepositoryRoot(fromDirectory: string): Promise<string | undefined> {
  const result = await runCommand("git", ["rev-parse", "--show-toplevel"], { cwd: fromDirectory });

  if (result.spawnError !== undefined) {
    throw new GitExecutableUnavailableError(result.spawnError);
  }

  if (result.exitCode !== 0 || result.stdout.length === 0) {
    return undefined;
  }

  return path.normalize(result.stdout);
}
