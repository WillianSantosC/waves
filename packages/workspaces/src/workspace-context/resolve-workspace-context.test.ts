import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createTestRepository, type TestRepository } from "@tests/git/create-test-repository.ts";
import { resolveWorkspaceContext } from "./resolve-workspace-context.ts";
import { WorkspaceResolutionError } from "./workspace-resolution-error.ts";

describe("resolveWorkspaceContext", () => {
  let repository: TestRepository | undefined;

  afterEach(async () => {
    await repository?.cleanup();
    repository = undefined;
  });

  it("captures the invocation directory and repository root when invoked from the root", async () => {
    repository = await createTestRepository();

    const context = await resolveWorkspaceContext(repository.root);

    expect(context.invocationDirectory).toBe(repository.root);
    expect(context.repositoryRoot).toBe(repository.root);
  });

  it("keeps the invocation directory distinct from the repository root for nested invocations", async () => {
    repository = await createTestRepository();
    const nested = path.join(repository.root, "nested", "dir");
    await mkdir(nested, { recursive: true });

    const context = await resolveWorkspaceContext(nested);

    expect(context.invocationDirectory).toBe(nested);
    expect(context.repositoryRoot).toBe(repository.root);
  });

  it("resolves correctly when the repository path contains spaces", async () => {
    repository = await createTestRepository("waves workspace test ");

    const context = await resolveWorkspaceContext(repository.root);

    expect(context.repositoryRoot).toBe(repository.root);
  });

  it("throws a structured WorkspaceResolutionError outside a Git repository", async () => {
    const nonRepoDir = await mkdtemp(path.join(tmpdir(), "waves-non-repo-"));

    try {
      await expect(resolveWorkspaceContext(nonRepoDir)).rejects.toMatchObject({
        name: "WorkspaceResolutionError",
        category: "OPERATIONAL",
        code: "WORKSPACE_NOT_A_GIT_REPOSITORY",
        retryable: false,
      });

      await expect(resolveWorkspaceContext(nonRepoDir)).rejects.toBeInstanceOf(
        WorkspaceResolutionError,
      );
    } finally {
      await rm(nonRepoDir, { recursive: true, force: true });
    }
  });
});
