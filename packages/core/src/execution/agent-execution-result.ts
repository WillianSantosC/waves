import type { AgentUsage } from "./agent-usage.ts";
import type { ExecutorSessionReference } from "./executor-session-reference.ts";

export interface AgentExecutionResult {
  status: "COMPLETED" | "FAILED";

  memoryWrites?: MemoryWriteCandidate[];
  artifactCandidates?: ArtifactCandidate[];
  humanReview?: HumanReviewModel;

  usage?: AgentUsage;
  session?: ExecutorSessionReference;

  error?: ExecutionError;
  metadata?: Record<string, unknown>;
}

export type MemoryWriteCandidate = Record<string, unknown>;

export type ArtifactCandidate = Record<string, unknown>;

export type HumanReviewModel = Record<string, unknown>;

export type ExecutionError = Record<string, unknown>;
