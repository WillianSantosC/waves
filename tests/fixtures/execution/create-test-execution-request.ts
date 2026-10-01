import type { AgentExecutionRequest, Workspace } from "@waves/core";

/**
 * Builds a minimal, valid `AgentExecutionRequest` for exercising the
 * Workspace/Runtime/Executor boundary in tests, without depending on the
 * not-yet-built Agent Profile/Task/Context/Permissions contracts.
 */
export function createTestExecutionRequest(
  workspace: Workspace,
  overrides: Partial<AgentExecutionRequest> = {},
): AgentExecutionRequest {
  return {
    runId: "test-run",
    nodeRunId: "test-node-run",
    agent: {},
    task: {},
    context: {},
    permissions: {},
    output: { format: "text" },
    expectations: [],
    workspace,
    executorSelection: { executorId: "test-executor", runtimeId: "test-runtime" },
    ...overrides,
  };
}
