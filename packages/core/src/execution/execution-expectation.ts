export interface ExecutionExpectation {
  id: string;

  source: ExpectationSource;
  required: boolean;

  outputKind?: string;
  sideEffect?: ExpectedSideEffect;
  evidence?: EvidenceRequirement;
}

export interface ExpectationSource {
  type: "node" | "profile" | "skill" | "workflow" | "policy";
  reference: string;
}

export interface ExpectedSideEffect {
  type: "code-change" | "file-created" | "test-contract" | "review-decision" | "artifact" | string;

  selector?: string;
  minimumCount?: number;
}

export interface EvidenceRequirement {
  id?: string;
  type: string;
  optional?: boolean;
  condition?: unknown;
  config?: Record<string, unknown>;
}
