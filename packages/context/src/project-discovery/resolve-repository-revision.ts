import { execFile } from "node:child_process";

/**
 * Best-effort current revision lookup. Returns `undefined` rather than
 * throwing when `git` is unavailable or the repository has no commits yet
 * (e.g. a freshly initialized repository) — a missing revision is a normal
 * discovery outcome, not a failure.
 */
export function resolveRepositoryRevision(repositoryRoot: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    execFile("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot }, (error, stdout) => {
      if (error) {
        resolve(undefined);
        return;
      }
      resolve(stdout.trim());
    });
  });
}
