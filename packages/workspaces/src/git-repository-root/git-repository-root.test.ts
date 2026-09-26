import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createTestRepository, type TestRepository } from "@tests/git/create-test-repository.ts";
import { resolveGitRepositoryRoot } from "./git-repository-root.ts";

describe("resolveGitRepositoryRoot", () => {
  let repository: TestRepository | undefined;

  afterEach(async () => {
    await repository?.cleanup();
    repository = undefined;
  });

  it("resolves the repository root when invoked from the root itself", async () => {
    repository = await createTestRepository();

    const root = await resolveGitRepositoryRoot(repository.root);

    expect(root).toBe(repository.root);
  });

  it("resolves the repository root when invoked from a nested subdirectory", async () => {
    repository = await createTestRepository();
    const nested = path.join(repository.root, "a", "b", "c");
    await mkdir(nested, { recursive: true });

    const root = await resolveGitRepositoryRoot(nested);

    expect(root).toBe(repository.root);
  });

  it("resolves the repository root when the path contains spaces", async () => {
    repository = await createTestRepository("waves workspace test ");

    const root = await resolveGitRepositoryRoot(repository.root);

    expect(root).toBe(repository.root);
  });

  it("returns undefined when the directory is not inside a Git repository", async () => {
    const nonRepoDir = await mkdtemp(path.join(tmpdir(), "waves-non-repo-"));

    try {
      const root = await resolveGitRepositoryRoot(nonRepoDir);

      expect(root).toBeUndefined();
    } finally {
      await rm(nonRepoDir, { recursive: true, force: true });
    }
  });
});
