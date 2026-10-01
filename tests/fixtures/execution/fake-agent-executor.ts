import type { AgentExecutionRequest, AgentExecutionResult } from "@waves/core";
import type { AgentExecutor, ExecutorCapabilities } from "@waves/executors";

/**
 * Minimal in-memory `AgentExecutor` used to prove that the executor
 * boundary can run against any `Workspace` produced by any
 * `WorkspaceStrategy`, and be hosted by any `AgentRuntime`, unchanged.
 * Not a real `ClaudeExecutor`/`CodexExecutor` implementation.
 */
export function createFakeAgentExecutor(
  id: string,
  capabilities: ExecutorCapabilities = {},
): AgentExecutor {
  return {
    id,

    async execute(request: AgentExecutionRequest): Promise<AgentExecutionResult> {
      return {
        status: "COMPLETED",
        metadata: {
          executorId: id,
          workspaceId: request.workspace.id,
          workspaceStrategy: request.workspace.strategy,
        },
      };
    },

    async capabilities(): Promise<ExecutorCapabilities> {
      return capabilities;
    },
  };
}
