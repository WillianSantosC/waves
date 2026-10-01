import type { NodeRunId, WorkflowRunId } from "../identifiers/identifiers.ts";
import type { Workspace } from "../workspace/workspace.ts";
import type { ExecutionExpectation } from "./execution-expectation.ts";
import type { ExecutorSessionReference } from "./executor-session-reference.ts";
import type { OutputContract } from "./output-contract.ts";
import type { ResolvedExecutorSelection } from "./resolved-executor-selection.ts";

export interface AgentExecutionRequest {
  runId: WorkflowRunId;
  nodeRunId: NodeRunId;

  agent: EffectiveAgentProfile;
  task: TaskContext;
  context: EffectiveAgentContext;

  permissions: AgentPermissions;
  output: OutputContract;
  expectations: ExecutionExpectation[];

  workspace: Workspace;
  executorSelection: ResolvedExecutorSelection;

  session?: ExecutorSessionReference;
}

export type EffectiveAgentProfile = Record<string, unknown>;

export type TaskContext = Record<string, unknown>;

export type EffectiveAgentContext = Record<string, unknown>;

export type AgentPermissions = Record<string, unknown>;
