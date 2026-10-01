import type { AgentExecutionResult } from "@waves/core";
import type { AgentExecutor } from "@waves/executors";
import type {
  AgentRuntime,
  RuntimeExecutionRequest,
  RuntimeHandle,
  RuntimeStatus,
} from "@waves/runtimes";

/**
 * Minimal in-memory `AgentRuntime` used to prove that the runtime boundary
 * can host any `AgentExecutor` fake unchanged, regardless of which
 * `WorkspaceStrategy` produced the request's `workspace`. Not a real
 * `LocalRuntime`/`OrcaRuntime` implementation.
 */
export function createFakeAgentRuntime(id: string, executor: AgentExecutor): AgentRuntime {
  const statuses = new Map<string, RuntimeStatus>();

  function key(handle: RuntimeHandle): string {
    return `${handle.runId}:${handle.nodeRunId}`;
  }

  return {
    id,

    async execute(request: RuntimeExecutionRequest): Promise<AgentExecutionResult> {
      const handleKey = `${request.runId}:${request.nodeRunId}`;
      statuses.set(handleKey, { state: "RUNNING" });

      const result = await executor.execute(request);

      statuses.set(handleKey, { state: result.status === "COMPLETED" ? "COMPLETED" : "FAILED" });
      return result;
    },

    async cancel(handle: RuntimeHandle): Promise<void> {
      statuses.set(key(handle), { state: "CANCELLED" });
    },

    async status(handle: RuntimeHandle): Promise<RuntimeStatus> {
      return statuses.get(key(handle)) ?? { state: "PENDING" };
    },
  };
}
