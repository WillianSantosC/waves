import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface FixtureRepository {
  root: string;
  cleanup(): Promise<void>;
}

/**
 * Writes a tree of files (relative path -> content) into a fresh temp Git
 * repository, for exercising `discoverProject` against representative
 * repository layouts.
 */
export async function writeFixtureRepository(
  files: Record<string, string>,
): Promise<FixtureRepository> {
  const root = await mkdtemp(path.join(tmpdir(), "waves-project-discovery-"));

  await execFileAsync("git", ["init", "--quiet"], { cwd: root });
  await execFileAsync("git", ["config", "user.email", "test@example.com"], { cwd: root });
  await execFileAsync("git", ["config", "user.name", "Waves Test"], { cwd: root });

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content);
  }

  return {
    root,
    async cleanup() {
      await rm(root, { recursive: true, force: true });
    },
  };
}

/**
 * Same as `writeFixtureRepository`, but also creates an initial commit so
 * `git rev-parse HEAD` resolves to a real revision.
 */
export async function writeFixtureRepositoryWithCommit(
  files: Record<string, string>,
): Promise<FixtureRepository> {
  const repository = await writeFixtureRepository(files);
  await execFileAsync("git", ["add", "-A"], { cwd: repository.root });
  await execFileAsync("git", ["commit", "--quiet", "-m", "initial"], { cwd: repository.root });
  return repository;
}
