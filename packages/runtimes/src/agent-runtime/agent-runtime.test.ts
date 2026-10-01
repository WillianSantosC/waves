import { createTestExecutionRequest } from "@tests/fixtures/execution/create-test-execution-request.ts";
import { createFakeAgentExecutor } from "@tests/fixtures/execution/fake-agent-executor.ts";
import { createFakeAgentRuntime } from "@tests/fixtures/execution/fake-agent-runtime.ts";
import { createFakeWorkspaceStrategy } from "@tests/fixtures/execution/fake-workspace-strategy.ts";
import { describe, expect, it } from "vitest";

describe("Workspace/Runtime/Executor independence", () => {
  it("runs the same executor against workspaces from different strategies, unchanged", async () => {
    const executor = createFakeAgentExecutor("fake-executor");
    const runtime = createFakeAgentRuntime("fake-runtime", executor);

    const currentStrategy = createFakeWorkspaceStrategy("current");
    const worktreeStrategy = createFakeWorkspaceStrategy("worktree");

    for (const strategy of [currentStrategy, worktreeStrategy]) {
      const workspace = await strategy.prepare({ repositoryRoot: "/repo" });
      const request = createTestExecutionRequest(workspace);

      const result = await runtime.execute(request);

      expect(result.status).toBe("COMPLETED");
      expect(result.metadata).toMatchObject({
        executorId: "fake-executor",
        workspaceStrategy: strategy.id,
      });
    }
  });

  it("hosts different executors under the same runtime and workspace strategy, unchanged", async () => {
    const strategy = createFakeWorkspaceStrategy("current");
    const workspace = await strategy.prepare({ repositoryRoot: "/repo" });

    const claudeLikeExecutor = createFakeAgentExecutor("claude-like");
    const codexLikeExecutor = createFakeAgentExecutor("codex-like");

    for (const executor of [claudeLikeExecutor, codexLikeExecutor]) {
      const runtime = createFakeAgentRuntime("fake-runtime", executor);
      const request = createTestExecutionRequest(workspace);

      const result = await runtime.execute(request);

      expect(result.status).toBe("COMPLETED");
      expect(result.metadata).toMatchObject({ executorId: executor.id });
    }
  });

  it("reports runtime status through the handle without depending on workspace or executor identity", async () => {
    const strategy = createFakeWorkspaceStrategy("worktree");
    const workspace = await strategy.prepare({ repositoryRoot: "/repo" });
    const executor = createFakeAgentExecutor("fake-executor");
    const runtime = createFakeAgentRuntime("fake-runtime", executor);
    const request = createTestExecutionRequest(workspace);

    await runtime.execute(request);
    const status = await runtime.status({
      runId: request.runId,
      nodeRunId: request.nodeRunId,
      runtimeId: runtime.id,
    });

    expect(status.state).toBe("COMPLETED");
  });
});
