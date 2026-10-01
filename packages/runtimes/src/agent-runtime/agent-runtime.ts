import type {
  AgentExecutionRequest,
  AgentExecutionResult,
  NodeRunId,
  RuntimeId,
  WorkflowRunId,
} from "@waves/core";

export interface AgentRuntime {
  id: RuntimeId;

  execute(request: RuntimeExecutionRequest): Promise<AgentExecutionResult>;

  cancel(handle: RuntimeHandle): Promise<void>;
  status(handle: RuntimeHandle): Promise<RuntimeStatus>;
}

export type RuntimeExecutionRequest = AgentExecutionRequest;

export interface RuntimeHandle {
  runId: WorkflowRunId;
  nodeRunId: NodeRunId;
  runtimeId: RuntimeId;
}

export interface RuntimeStatus {
  state: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
}
