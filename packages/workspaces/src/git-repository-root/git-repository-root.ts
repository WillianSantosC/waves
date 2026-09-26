import path from "node:path";
import { runCommand } from "@/command-runner/command-runner.ts";

export async function resolveGitRepositoryRoot(fromDirectory: string): Promise<string | undefined> {
  const result = await runCommand("git", ["rev-parse", "--show-toplevel"], { cwd: fromDirectory });

  if (result.exitCode !== 0 || result.stdout.length === 0) {
    return undefined;
  }

  return path.normalize(result.stdout);
}
