export const PACKAGE_NAME = "@waves/core";

export type {
  TaskId,
  WorkflowId,
  WorkflowRunId,
  NodeId,
  NodeRunId,
  AgentProfileId,
  SkillId,
  ArtifactId,
  EvidenceId,
  ApprovalId,
  MemorySnapshotId,
  ProviderId,
  WorkspaceId,
  RuntimeId,
  ExecutorId,
  CheckpointId,
} from "./identifiers/identifiers.ts";

export type { Workspace } from "./workspace/workspace.ts";

export type { AgentUsage, Money } from "./execution/agent-usage.ts";
export type { OutputContract } from "./execution/output-contract.ts";
export type {
  ExecutionExpectation,
  ExpectationSource,
  ExpectedSideEffect,
  EvidenceRequirement,
} from "./execution/execution-expectation.ts";
export type { ExecutorSessionReference } from "./execution/executor-session-reference.ts";
export type { ResolvedExecutorSelection } from "./execution/resolved-executor-selection.ts";
export type {
  AgentExecutionRequest,
  EffectiveAgentProfile,
  TaskContext,
  EffectiveAgentContext,
  AgentPermissions,
} from "./execution/agent-execution-request.ts";
export type {
  AgentExecutionResult,
  MemoryWriteCandidate,
  ArtifactCandidate,
  HumanReviewModel,
  ExecutionError,
} from "./execution/agent-execution-result.ts";
