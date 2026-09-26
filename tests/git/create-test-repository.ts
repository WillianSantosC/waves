import { execFile } from "node:child_process";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export interface TestRepository {
  root: string;
  cleanup(): Promise<void>;
}

export async function createTestRepository(
  dirNamePrefix = "waves-workspace-test-",
): Promise<TestRepository> {
  const created = await mkdtemp(path.join(tmpdir(), dirNamePrefix));
  // Resolve symlinks (e.g. macOS /tmp -> /private/tmp) so the root matches
  // what `git rev-parse --show-toplevel` reports.
  const root = await realpath(created);

  await runGit(root, ["init", "--quiet"]);
  await runGit(root, ["config", "user.email", "test@example.com"]);
  await runGit(root, ["config", "user.name", "Waves Test"]);

  return {
    root,
    async cleanup() {
      await rm(root, { recursive: true, force: true });
    },
  };
}

function runGit(cwd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    // Explicitly pin `env` to the current process's environment so `git` is
    // resolved through a known, inherited PATH (the trusted CI/developer
    // environment running this test suite) rather than an implicit lookup.
    execFile("git", args, { cwd, env: process.env }, (error) => {
      if (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
        return;
      }
      resolve();
    });
  });
}
