import type { AgentExecutionRequest, AgentExecutionResult, ExecutorId } from "@waves/core";
import type { ExecutorCapabilities } from "./executor-capabilities.ts";

export interface AgentExecutor {
  id: ExecutorId;

  execute(request: AgentExecutionRequest): Promise<AgentExecutionResult>;

  capabilities(): Promise<ExecutorCapabilities>;
}
