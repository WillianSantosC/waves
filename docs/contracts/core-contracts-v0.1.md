# Waves --- Core Contracts v0.1

## 1. Objective

This document defines the provider-neutral contracts that support
Architecture v0.1.

The contracts intentionally separate workflow semantics from concrete
providers and preserve the architecture:

```text
WHAT        Workflow / Task / Node / Artifact
WHO         Agent Profile / Skills
WHERE       Workspace / Runtime
HOW         Executor / Model
CONSTRAINTS Config / Policy / Permissions / Budget
KNOWLEDGE   Context / Memory
PROOF       Supervision / Evidence / Gates
RECOVERY    Failure / Recovery / Side Effects
```

Types below are conceptual TypeScript contracts. Exact package placement
may evolve while preserving semantics.

---

# 2. Fundamental Identifiers

```ts
type TaskId = string;
type WorkflowId = string;
type WorkflowRunId = string;
type NodeId = string;
type NodeRunId = string;
type AgentProfileId = string;
type SkillId = string;
type ArtifactId = string;
type EvidenceId = string;
type ApprovalId = string;
type MemorySnapshotId = string;
type ProviderId = string;
type WorkspaceId = string;
type RuntimeId = string;
type ExecutorId = string;
type CheckpointId = string;
```

---

# 3. Task Input and Context

```ts
type TaskInput =
  | { type: "prompt"; prompt: string }
  | { type: "file"; path: string }
  | { type: "external"; provider: ProviderId; reference: string };

interface TaskContext {
  id?: TaskId;
  title: string;
  description?: string;
  acceptanceCriteria?: string[];
  source?: TaskSource;
  attachments?: ArtifactReference[];
  metadata?: Record<string, unknown>;
}

interface TaskSource {
  provider: string;
  externalId?: string;
  reference?: string;
  url?: string;
}
```

External task providers normalize into `TaskContext`; downstream
workflow code does not depend on issue-tracker-specific types.

---

# 4. Versioned Layered Configuration

```ts
interface WavesConfig {
  version: number;
  project?: ProjectConfig;
  commands?: ProjectCommands;
  context?: ContextConfig;
  agents?: AgentConfig;
  workflows?: WorkflowConfig;
  execution?: ExecutionConfig;
  approvals?: ApprovalConfig;
  policies?: PolicyConfig;
  failure?: FailurePolicy;
  recovery?: RecoveryPolicy;
  evidence?: EvidenceConfig;
  memory?: MemoryConfig;
  observability?: ObservabilityConfig;
  integrations?: IntegrationConfig;
  ui?: UserInterfaceConfig;
}
```

Configuration sources are explicit:

```ts
type ConfigSourceKind =
  | "builtin"
  | "user"
  | "project"
  | "profile"
  | "workflow"
  | "node"
  | "environment"
  | "cli"
  | "discovered";

interface ResolvedValue<T> {
  value: T;
  source: ConfigSource;
}

interface ConfigSource {
  kind: ConfigSourceKind;
  reference?: string;
}
```

The resolver returns a validated result with provenance:

```ts
interface ResolvedConfig {
  version: number;
  values: WavesConfig;
  provenance: Record<string, ConfigSource>;
  policySnapshot: PolicySnapshot;
  resolvedAt: Date;
}
```

Mandatory policy is a constraint boundary, not a normal preference
layer.

---

# 5. Configuration Resolver

```ts
interface ConfigurationResolver {
  resolve(input: ConfigurationResolutionRequest): Promise<ResolvedConfig>;
  validate(input: WavesConfig): Promise<ConfigurationValidationResult>;
  explain(path?: string): Promise<ConfigurationExplanation>;
}
```

No execution subsystem should independently parse project YAML or
provider configuration.

---

# 6. Provider Descriptor

```ts
type ProviderCategory = string;

interface ProviderDescriptor<TOptions = unknown> {
  id: ProviderId;
  category: ProviderCategory;
  version: string;
  displayName: string;
  description?: string;

  optionsSchema: unknown;
  capabilities: ProviderCapability[];

  availability?: ProviderAvailabilityProbe;
  setup?: ProviderSetupMetadata;
  diagnostics?: ProviderDiagnosticMetadata;
}
```

Categories remain extensible.

Initial values may include:

```text
executor
runtime
project-memory
agent-handoff
evidence
security
observability
task-source
context-source
review
delivery
deployment
rollout-observation
production-signal
```

---

# 7. Provider Capability

```ts
interface ProviderCapability {
  id: string;
  version?: string;
  attributes?: Record<string, unknown>;
}

interface CapabilityRequirement {
  id: string;
  minimumVersion?: string;
  attributes?: Record<string, unknown>;
  required: boolean;
}
```

Capability matching is provider-neutral.

---

# 8. Provider Availability

```ts
type ProviderAvailabilityState =
  | "AVAILABLE"
  | "UNAVAILABLE"
  | "MISCONFIGURED"
  | "UNSUPPORTED_VERSION"
  | "UNSUPPORTED_CAPABILITY"
  | "OPTIONAL_NOT_INSTALLED";

interface ProviderAvailability {
  state: ProviderAvailabilityState;
  reasons?: string[];
  metadata?: Record<string, unknown>;
}
```

---

# 9. Provider Registry

```ts
interface ProviderRegistry {
  register(descriptor: ProviderDescriptor): void;

  get(category: ProviderCategory, id: ProviderId): ProviderDescriptor | undefined;

  list(category?: ProviderCategory): ProviderDescriptor[];

  findByCapabilities(
    category: ProviderCategory,
    requirements: CapabilityRequirement[],
  ): ProviderDescriptor[];

  checkAvailability(category: ProviderCategory, id: ProviderId): Promise<ProviderAvailability>;
}
```

Duplicate IDs within a category fail deterministically unless an
explicit versioned replacement mechanism exists.

---

# 10. Provider Reference

```ts
interface ProviderReference<TOptions = unknown> {
  provider: ProviderId;
  required?: boolean;
  options?: TOptions;
}
```

Provider-specific options are validated by the selected descriptor
schema.

---

# 11. Workflow Definition

```ts
interface WorkflowDefinition {
  version: number;
  id: WorkflowId;
  name: string;
  description?: string;

  nodes: WorkflowNodeDefinition[];

  defaults?: WorkflowDefaults;
  policies?: WorkflowPolicies;
  inputs?: WorkflowInputDefinition[];
  outputs?: WorkflowOutputDefinition[];
}
```

---

# 12. Workflow Nodes

```ts
type WorkflowNodeDefinition =
  | AgentNodeDefinition
  | CommandNodeDefinition
  | GateNodeDefinition
  | HumanNodeDefinition
  | WorkflowReferenceNodeDefinition
  | ProviderActionNodeDefinition;

interface BaseNodeDefinition {
  id: NodeId;
  dependsOn?: NodeId[];
  condition?: NodeCondition;
  optional?: boolean;
  skippable?: boolean;
  timeoutMs?: number;
  retry?: NodeRetryPolicy;
  policies?: NodePolicyOverrides;
}
```

---

# 13. Agent Node

```ts
interface AgentNodeDefinition extends BaseNodeDefinition {
  type: "agent";
  agent: AgentReference;

  skills?: SkillBinding[];
  context?: ContextProjectionHints;
  permissions?: AgentPermissionRestriction;

  workspace?: WorkspaceStrategyReference;
  runtime?: ProviderReference;
  executor?: ExecutorSelection;

  output?: OutputContract;
  expectations?: ExecutionExpectation[];
  evidence?: EvidencePolicy;
}
```

---

# 14. Command Node

```ts
interface CommandNodeDefinition extends BaseNodeDefinition {
  type: "command";

  command?: { executable: string; args?: string[] } | { projectCommand: keyof ProjectCommands };

  cwd?: string;
  environment?: Record<string, string>;
  evidence?: EvidencePolicy;
}
```

Command success is determined from deterministic process results.

---

# 15. Human and Gate Nodes

```ts
interface HumanNodeDefinition extends BaseNodeDefinition {
  type: "human";
  mode: "approval" | "input";
  review?: HumanReviewReference;
}

interface GateNodeDefinition extends BaseNodeDefinition {
  type: "gate";
  gate: string;
  config?: Record<string, unknown>;
}
```

---

# 16. Nested Workflow Node

```ts
interface WorkflowReferenceNodeDefinition extends BaseNodeDefinition {
  type: "workflow";
  workflow: WorkflowReference;
  inputs?: Record<string, WorkflowValueReference>;
  outputs?: Record<string, string>;
}
```

Parent and child runs preserve independent history and explicit
input/output mapping.

---

# 17. Provider Action Node

```ts
interface ProviderActionNodeDefinition extends BaseNodeDefinition {
  type: "provider-action";
  category: ProviderCategory;
  provider?: ProviderReference;
  action: string;
  input?: Record<string, WorkflowValueReference>;
  evidence?: EvidencePolicy;
}
```

This supports future delivery/deployment actions without hard-coding
concrete providers into WorkflowEngine.

---

# 18. Run Entry Point

```ts
interface RunEntryPoint {
  startAt?: NodeId;
  targetNodes?: NodeId[];
  prerequisites?: PrerequisiteSatisfaction[];
}
```

Absence means normal full workflow execution.

---

# 19. Prerequisite Satisfaction

```ts
type PrerequisiteSatisfactionKind =
  "artifact" | "memory" | "context" | "external-contract" | "policy-approved-assumption";

interface PrerequisiteSatisfaction {
  nodeId: NodeId;
  requirementId?: string;
  kind: PrerequisiteSatisfactionKind;

  reference?: string;
  artifact?: ArtifactReference;
  snapshot?: MemorySnapshotReference;

  contentHash?: string;
  version?: string;

  source: PrerequisiteSource;
  suppliedAt: Date;
}
```

```ts
interface PrerequisiteSource {
  type: "user" | "external" | "workflow" | "system";
  reference?: string;
  provider?: ProviderId;
}
```

An omitted upstream node is never represented as a successful
AgentExecution.

---

# 20. Workflow Run

```ts
interface WorkflowRun {
  id: WorkflowRunId;
  workflowId: WorkflowId;
  taskId?: TaskId;

  status: WorkflowRunStatus;
  entryPoint?: RunEntryPoint;

  configSnapshotId: string;
  budgetState?: BudgetState;

  createdAt: Date;
  updatedAt: Date;
}
```

---

# 21. Workflow Run Status

```ts
type WorkflowRunStatus =
  | "CREATED"
  | "RUNNING"
  | "WAITING_INPUT"
  | "WAITING_APPROVAL"
  | "FAILED"
  | "COMPLETED"
  | "CANCELLED";
```

---

# 22. Node Run

```ts
interface NodeRun {
  id: NodeRunId;
  workflowRunId: WorkflowRunId;
  nodeId: NodeId;

  attempt: number;
  status: NodeRunStatus;

  skipReason?: NodeSkipReason;
  externalSatisfaction?: PrerequisiteSatisfaction[];

  startedAt?: Date;
  completedAt?: Date;
  failure?: ExecutionError;
}
```

---

# 23. Node Run Status

```ts
type NodeRunStatus =
  | "PENDING"
  | "READY"
  | "RUNNING"
  | "WAITING_INPUT"
  | "WAITING_APPROVAL"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED"
  | "INVALIDATED"
  | "CANCELLED";
```

```ts
type NodeSkipReason =
  "condition-false" | "externally-satisfied" | "budget-policy" | "explicit-selection" | string;
```

---

# 24. Agent Profile

```ts
interface AgentProfile {
  id: AgentProfileId;
  role: string;
  purpose?: string;

  capabilities?: AgentCapability[];
  permissions?: AgentPermissions;
  context?: ContextProjectionHints;

  skills?: SkillBinding[];

  runtimePreference?: ProviderReference;
  executorPreference?: ExecutorSelection;

  expectations?: ExecutionExpectation[];
}
```

Agent Profile is provider-neutral.

---

# 25. Agent Registry

```ts
interface AgentRegistry {
  get(reference: AgentReference): Promise<AgentProfile>;
  list(): Promise<AgentProfile[]>;
  resolve(
    reference: AgentReference,
    overrides?: AgentProfileOverrides,
  ): Promise<EffectiveAgentProfile>;
}
```

---

# 26. Skill Binding

```ts
type SkillBindingMode = "required" | "preferred" | "disabled";

interface SkillBinding {
  skill: SkillId;
  mode: SkillBindingMode;
}
```

---

# 27. Skill Expectation

```ts
interface SkillExpectation {
  id: string;
  outputKinds?: string[];
  sideEffects?: ExpectedSideEffect[];
  evidence?: EvidenceRequirement[];
  mandatory?: boolean;
}
```

Contradictory mandatory expectations fail before execution.

---

# 28. Agent Permissions

```ts
interface AgentPermissions {
  filesystem?: "none" | "read" | "write";
  shell?: boolean;
  network?: boolean;
  git?: "none" | "read" | "write";
  tools?: string[];
  integrations?: string[];

  allowedPaths?: string[];
  deniedPaths?: string[];
  allowedCommands?: string[];
}
```

Effective permissions are the intersection of requested capability and
higher-authority policy.

---

# 29. Project Context Snapshot

```ts
interface ProjectContextSnapshot {
  id: string;
  projectId: string;
  version: number;

  repository: RepositoryContext;
  resources: ContextResource[];
  commands: ProjectCommands;
  skillLocations: string[];

  repositoryRevision?: string;
  sourceFingerprints: Record<string, string>;

  generatedAt: Date;
}
```

---

# 30. Workflow Memory

```ts
interface WorkflowMemoryStore {
  get(runId: WorkflowRunId, key: MemoryKey): Promise<MemoryEntry | undefined>;

  set(runId: WorkflowRunId, entry: MemoryEntry): Promise<void>;

  list(runId: WorkflowRunId, prefix?: string): Promise<MemoryEntry[]>;

  snapshot(runId: WorkflowRunId, selection: MemorySelection): Promise<MemorySnapshot>;
}
```

Workflow Memory is Waves-owned and has no external provider selector.

---

# 31. Memory Snapshot

```ts
interface MemorySnapshot {
  id: MemorySnapshotId;
  workflowRunId: WorkflowRunId;

  entries: MemoryEntry[];
  contentHash: string;

  createdAt: Date;
}
```

Snapshots are immutable.

---

# 32. Project Memory Provider

```ts
interface ProjectMemoryProvider {
  recall(request: ProjectMemoryRecallRequest): Promise<ProjectMemoryRecallResult>;

  save(candidate: ProjectMemoryCandidate): Promise<ProjectMemoryEntry>;

  supersede(previousId: string, candidate: ProjectMemoryCandidate): Promise<ProjectMemoryEntry>;

  archive(id: string): Promise<void>;

  health(): Promise<ProviderAvailability>;
}
```

Project Memory is optional for workflow correctness.

---

# 33. Agent Handoff Store

```ts
interface AgentHandoffStore {
  create(record: AgentHandoffRecord): Promise<string>;
  get(id: string): Promise<AgentHandoffRecord | undefined>;
  claim(id: string, consumer: string): Promise<AgentHandoffRecord>;
  list(query: AgentHandoffQuery): Promise<AgentHandoffRecord[]>;
}
```

Handoff is not a replacement for run-scoped Workflow Memory.

---

# 34. Context Source Provider

```ts
interface ContextSourceProvider {
  search(request: ExternalContextSearchRequest): Promise<ExternalContextSearchResult>;

  retrieve(request: ExternalContextRetrieveRequest): Promise<ExternalContextResource>;

  health(): Promise<ProviderAvailability>;
}
```

```ts
interface ExternalContextResource {
  reference: string;
  title?: string;
  type?: string;
  content: string;

  provenance: ContextProvenance;
  freshness?: {
    observedAt?: Date;
    sourceUpdatedAt?: Date;
  };

  metadata?: Record<string, unknown>;
}
```

MCP-backed adapters implement this contract without making MCP part of
core context semantics.

---

# 35. Context Projection

```ts
interface ContextProjection {
  required?: ContextSelector[];
  relevant?: ContextSelector[];
  optional?: ContextSelector[];

  maxTokens?: number;
  maxBytes?: number;

  projectMemory?: MemoryRecallBudget;
  externalSources?: ExternalContextBudget[];
}
```

```ts
interface EffectiveAgentContext {
  task: TaskContext;
  resources: ProjectedContextResource[];
  skills: ResolvedSkill[];
  artifacts: ArtifactReference[];
  memory: ProjectedMemoryEntry[];

  accounting: ContextAccounting;
}
```

---

# 36. Context Accounting

```ts
interface ContextAccounting {
  estimatedTokens?: number;
  exactTokens?: number;
  uncertainty?: "low" | "medium" | "high";

  included: ContextDecision[];
  excluded: ContextDecision[];
  truncated: ContextDecision[];
}
```

Required context overflow produces a clear error rather than silent
removal.

---

# 37. Context Resolver

```ts
interface ContextResolver {
  resolve(request: ContextResolutionRequest): Promise<EffectiveAgentContext>;
}
```

The resolver owns deterministic filtering, deduplication, ordering, and
budget enforcement before optional model-assisted compression.

---

# 38. Executor Session Reference

```ts
interface ExecutorSessionReference {
  provider: ProviderId;
  opaqueId: string;
  metadata?: Record<string, unknown>;
}
```

This is an optimization only. Persisted Waves state remains sufficient
for recovery.

---

# 39. Workspace Strategy

```ts
interface WorkspaceStrategy {
  id: string;

  prepare(request: WorkspacePreparationRequest): Promise<Workspace>;

  inspect(id: WorkspaceId): Promise<Workspace>;
  cleanup(id: WorkspaceId): Promise<void>;
}
```

```ts
interface Workspace {
  id: WorkspaceId;
  repositoryRoot: string;
  path: string;
  strategy: string;

  baseRevision?: string;
  branch?: string;
  metadata?: Record<string, unknown>;
}
```

---

# 40. Runtime

```ts
interface AgentRuntime {
  id: RuntimeId;

  execute(request: RuntimeExecutionRequest): Promise<AgentExecutionResult>;

  cancel(handle: RuntimeHandle): Promise<void>;
  status(handle: RuntimeHandle): Promise<RuntimeStatus>;
}
```

Runtime hosts execution; it does not construct prompts or resolve
skills/context.

---

# 41. Executor

```ts
interface AgentExecutor {
  id: ExecutorId;

  execute(request: AgentExecutionRequest): Promise<AgentExecutionResult>;

  capabilities(): Promise<ExecutorCapabilities>;
}
```

---

# 42. Executor Capabilities

```ts
interface ExecutorCapabilities {
  structuredOutput?: boolean;
  sessionResume?: boolean;
  images?: boolean;
  tools?: boolean;
  mcp?: boolean;
  workspaceEditing?: boolean;

  usageAccounting?: {
    tokens?: boolean;
    cachedTokens?: boolean;
    monetaryCost?: boolean;
  };

  contextWindow?: number;
}
```

---

# 43. Agent Execution Request

```ts
interface AgentExecutionRequest {
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
```

The executor receives already-resolved context and constraints.

---

# 44. Agent Execution Result

```ts
interface AgentExecutionResult {
  status: "COMPLETED" | "FAILED";

  memoryWrites?: MemoryWriteCandidate[];
  artifactCandidates?: ArtifactCandidate[];
  humanReview?: HumanReviewModel;

  usage?: AgentUsage;
  session?: ExecutorSessionReference;

  error?: ExecutionError;
  metadata?: Record<string, unknown>;
}
```

A completed result is not yet an accepted engineering result.

---

# 45. Agent Usage

```ts
interface AgentUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cachedInputTokens?: number;

  estimatedCost?: Money;
  usageSource?: "provider" | "waves-estimate" | "unknown";
}
```

```ts
interface Money {
  amount: number;
  currency: string;
  estimationSource?: string;
}
```

Unknown usage is represented as unknown, not zero.

---

# 46. Output Contract

```ts
interface OutputContract {
  format: "text" | "json" | "structured";
  schema?: unknown;

  requiredMemoryKeys?: string[];
  requiredArtifacts?: string[];
  humanReview?: boolean;
}
```

---

# 47. Execution Expectation

```ts
interface ExecutionExpectation {
  id: string;

  source: ExpectationSource;
  required: boolean;

  outputKind?: string;
  sideEffect?: ExpectedSideEffect;
  evidence?: EvidenceRequirement;
}
```

```ts
interface ExpectationSource {
  type: "node" | "profile" | "skill" | "workflow" | "policy";
  reference: string;
}
```

---

# 48. Expected Side Effect

```ts
interface ExpectedSideEffect {
  type: "code-change" | "file-created" | "test-contract" | "review-decision" | "artifact" | string;

  selector?: string;
  minimumCount?: number;
}
```

---

# 49. Execution Supervisor

```ts
interface ExecutionSupervisor {
  evaluate(input: ExecutionSupervisionInput): Promise<ExecutionSupervisionResult>;
}
```

```ts
interface ExecutionSupervisionInput {
  request: AgentExecutionRequest;
  result: AgentExecutionResult;

  expectations: ExecutionExpectation[];
  taskImpact?: TaskImpactAssessment;

  workspace: Workspace;
  artifacts: ArtifactReference[];
}
```

```ts
type SupervisionOutcome = "ACCEPTED" | "REJECTED" | "CORRECTION_REQUIRED";

interface ExecutionSupervisionResult {
  outcome: SupervisionOutcome;
  findings: SupervisionFinding[];

  acceptedMemoryWrites?: MemoryWriteCandidate[];
  acceptedArtifacts?: ArtifactCandidate[];
}
```

Supervision does not decide retry policy.

---

# 50. Supervision Finding

```ts
interface SupervisionFinding {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;

  expectationId?: string;
  provenance?: ExpectationSource;

  path?: string;
  metadata?: Record<string, unknown>;
}
```

---

# 51. Artifact

```ts
type ArtifactPurpose = "contract" | "evidence" | "deliverable" | "audit" | string;

interface Artifact {
  id: ArtifactId;
  type: string;
  purpose: ArtifactPurpose;

  producer: ArtifactProducer;
  version: number;

  location: ArtifactLocation;
  contentHash: string;

  createdAt: Date;
  metadata?: Record<string, unknown>;
}
```

Artifacts are immutable conceptually; updates create new versions.

---

# 52. Artifact Dependency

```ts
interface ArtifactDependency {
  sourceArtifactId: ArtifactId;
  targetArtifactId: ArtifactId;

  relationship: "derived-from" | "validated-by" | "implements" | "reviews" | string;
}
```

Dependencies support invalidation and later historical relationship
indexing.

---

# 53. Evidence

```ts
interface Evidence {
  id: EvidenceId;
  type: string;

  workflowRunId: WorkflowRunId;
  nodeRunId?: NodeRunId;

  collector: string;
  artifact?: ArtifactReference;

  assertion?: EvidenceAssertion;
  createdAt: Date;

  metadata?: Record<string, unknown>;
}
```

Evidence is proof, not automatically success.

---

# 54. Evidence Policy

```ts
interface EvidencePolicy {
  mode: "all" | "any";
  requirements: EvidenceRequirement[];
}

interface EvidenceRequirement {
  id?: string;
  type: string;
  optional?: boolean;
  condition?: NodeCondition;
  config?: Record<string, unknown>;
}
```

---

# 55. Gate

```ts
interface Gate {
  id: string;

  evaluate(context: GateEvaluationContext): Promise<GateResult>;
}
```

```ts
interface GateResult {
  status: "PASSED" | "FAILED" | "WAITING";
  reasons?: GateReason[];
  producedArtifacts?: ArtifactReference[];
  metadata?: Record<string, unknown>;
}
```

Gates should be deterministic where possible.

---

# 56. Human Review Model

```ts
interface HumanReviewModel {
  title: string;
  summary?: string;

  sections: HumanReviewSection[];
  warnings?: HumanReviewWarning[];

  decisions?: HumanReviewDecision[];
  references?: HumanReviewReference[];
}
```

Rendering is separate from the model.

---

# 57. Approval Record

```ts
interface ApprovalRecord {
  id: ApprovalId;
  workflowRunId: WorkflowRunId;
  nodeRunId?: NodeRunId;

  status: "PENDING" | "APPROVED" | "REJECTED";

  snapshot: MemorySnapshotReference;
  artifacts?: ArtifactApprovalReference[];

  feedback?: string;
  decidedAt?: Date;
}
```

Approval applies only to the exact referenced versions.

---

# 58. Budget Policy

```ts
interface BudgetPolicy {
  run?: BudgetLimit;
  nodes?: Record<NodeId, BudgetLimit>;
  agents?: Record<AgentProfileId, BudgetLimit>;

  thresholds?: BudgetThreshold[];
  exhaustion?: BudgetActionPolicy[];

  projectCeiling?: BudgetLimit;
}
```

```ts
interface BudgetLimit {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  monetary?: Money;
}
```

---

# 59. Budget State

```ts
interface BudgetState {
  observed: UsageAggregate;
  estimatedFuture?: UsageEstimate;
  limits?: BudgetLimit;
  remaining?: BudgetRemaining;
  support: BudgetSupport;
}
```

```ts
interface BudgetSupport {
  tokens: "exact" | "estimated" | "unsupported";
  monetary: "exact" | "estimated" | "unsupported";
}
```

---

# 60. Budget Actions

```ts
type BudgetAction =
  | "continue"
  | "warn"
  | "pause"
  | "stop"
  | "reduce-context"
  | "use-compatible-lower-cost-model"
  | "skip-optional-stage"
  | "require-approval";

interface BudgetDecision {
  action: BudgetAction;
  reason: string;

  beforeExecution: boolean;
  remaining?: BudgetRemaining;
  metadata?: Record<string, unknown>;
}
```

Fallback/skip actions require explicit policy authorization.

---

# 61. Budget Evaluator

```ts
interface BudgetEvaluator {
  evaluate(request: BudgetEvaluationRequest): Promise<BudgetDecision>;
}
```

Budget evaluation occurs before every paid AgentNode invocation.

---

# 62. Task Impact Assessment

```ts
interface TaskImpactAssessment {
  id: string;
  version: number;

  affectedAreas: ImpactArea[];
  expectedPaths?: string[];
  relevantTests?: string[];
  relevantContracts?: string[];
  protectedAreas?: string[];

  risk?: RiskLevel;
  rationale?: string[];
  confidence?: number;

  provenance: AssessmentProvenance[];
  createdAt: Date;
}
```

Expected paths are advisory unless a stronger policy makes an area
restricted.

---

# 63. Change Risk Assessment

```ts
type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "UNKNOWN";

interface ChangeRiskAssessment {
  id: string;
  version: number;

  level: RiskLevel;
  signals: ChangeRiskSignal[];
  rationale: string[];

  confidence?: number;
  uncertainty?: string[];

  taskImpactAssessmentId?: string;
  provenance: AssessmentProvenance[];

  createdAt: Date;
}
```

---

# 64. Change Risk Signal

```ts
interface ChangeRiskSignal {
  type:
    | "protected-path"
    | "large-diff"
    | "dependency-change"
    | "migration"
    | "infrastructure-change"
    | "configuration-change"
    | "security-finding"
    | "missing-evidence"
    | "scope-deviation"
    | "contract-conflict"
    | string;

  severity: RiskLevel;
  source: "deterministic" | "agent" | "provider" | "human";
  rationale?: string;
  reference?: string;
}
```

Deterministic/policy signals cannot be silently downgraded by an agent.

---

# 65. Failure Category

```ts
type FailureCategory =
  "OPERATIONAL" | "ENGINEERING" | "CONTRACT" | "SPECIFICATION" | "SECURITY" | "POLICY";
```

---

# 66. Execution Error

```ts
interface ExecutionError {
  category: FailureCategory;
  code: string;
  message: string;

  retryable?: boolean;
  details?: unknown;
}
```

Failure category and recovery action remain separate.

---

# 67. Recovery Action

```ts
type RecoveryAction =
  | "retry"
  | "stop"
  | "pause-human-review"
  | "continue-safe"
  | "degrade"
  | "rollback"
  | "compensate-if-supported";
```

---

# 68. Side-Effect Classification

```ts
type SideEffectClass =
  | "read-only"
  | "local-reversible"
  | "external-reversible"
  | "external-compensatable"
  | "irreversible"
  | "unknown";

interface SideEffectDescriptor {
  class: SideEffectClass;
  provider?: ProviderId;
  action?: string;

  reversible?: boolean;
  compensatable?: boolean;
  requiresApproval?: boolean;

  externalReference?: string;
}
```

Unknown capability is handled conservatively.

---

# 69. Failure Policy

```ts
interface FailurePolicy {
  operationalRetries?: number;
  engineeringRetries?: number;
  specificationFailureThreshold?: number;

  onContractConflict?: RecoveryAction;
  onSecurityFailure?: RecoveryAction;
  onPolicyFailure?: RecoveryAction;
}
```

Retries create new attempts and preserve history.

---

# 70. Recovery Policy

```ts
interface RecoveryPolicy {
  byFailure?: Partial<Record<FailureCategory, RecoveryAction[]>>;
  bySideEffect?: Partial<Record<SideEffectClass, RecoveryAction[]>>;

  requireApprovalForIrreversible?: boolean;
  allowGracefulDegradation?: boolean;
}
```

---

# 71. Checkpoint Manager

```ts
interface CheckpointManager {
  capture(workspace: Workspace, context: CheckpointCaptureRequest): Promise<WorkspaceCheckpoint>;

  restore(checkpoint: WorkspaceCheckpoint): Promise<CheckpointRestoreResult>;
}
```

```ts
interface WorkspaceCheckpoint {
  id: CheckpointId;
  workspaceId: WorkspaceId;
  nodeRunId?: NodeRunId;
  revision?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
```

Crash recovery and checkpoint restore are distinct operations.

---

# 72. Compensation Provider Capability

```ts
interface CompensationCapability {
  canCompensate(effect: SideEffectDescriptor): Promise<boolean>;

  compensate(request: CompensationRequest): Promise<CompensationResult>;
}
```

Waves never reports compensation success when unsupported, partial, or
failed.

---

# 73. Review Finding and Reconciliation

```ts
interface ReviewFinding {
  id: string;
  source: string;
  severity?: string;
  message: string;
  location?: string;
  evidence?: ArtifactReference[];
  metadata?: Record<string, unknown>;
}
```

```ts
type ReconciliationDecision =
  "CONFIRMED" | "FALSE_POSITIVE" | "OBSOLETE" | "HUMAN_JUDGMENT_REQUIRED";

interface ReviewReconciliationResult {
  findingId: string;
  decision: ReconciliationDecision;
  rationale?: string;
  evidence?: ArtifactReference[];
}
```

Correction work is created only after reconciliation confirms it is
appropriate.

---

# 74. Scheduler

```ts
interface Scheduler {
  getReadyNodes(workflow: WorkflowDefinition, state: WorkflowExecutionState): Promise<NodeId[]>;

  createWave(ready: NodeId[], policy: SchedulingPolicy): Promise<ExecutionWave>;
}
```

The scheduler is role-agnostic.

---

# 75. Execution Wave

```ts
interface ExecutionWave {
  index: number;
  nodeIds: NodeId[];
  maxParallelism: number;
}
```

`maxParallelism: 1` remains a supported sequential mode.

---

# 76. Workflow Engine

```ts
interface WorkflowEngine {
  start(definition: WorkflowDefinition, input: WorkflowStartRequest): Promise<WorkflowRun>;

  resume(workflowRunId: WorkflowRunId): Promise<WorkflowRun>;

  cancel(workflowRunId: WorkflowRunId): Promise<void>;

  approve(request: ApprovalRequest): Promise<void>;

  reject(request: RejectionRequest): Promise<void>;
}
```

---

# 77. Workflow Start Request

```ts
interface WorkflowStartRequest {
  task: TaskContext;

  entryPoint?: RunEntryPoint;
  config: ResolvedConfig;

  workspaceContext: WorkspaceContext;
  projectContext: ProjectContextSnapshot;

  budgetPolicy?: BudgetPolicy;
}
```

Standalone execution creates a minimal WorkflowDefinition and uses the
same start path.

---

# 78. Node Handler Registry

```ts
interface NodeHandler<TNode extends WorkflowNodeDefinition = WorkflowNodeDefinition> {
  type: TNode["type"];

  execute(node: TNode, context: NodeExecutionContext): Promise<NodeExecutionOutcome>;
}

interface NodeHandlerRegistry {
  register(handler: NodeHandler): void;
  get(type: string): NodeHandler;
}
```

This keeps WorkflowEngine generic.

---

# 79. Workflow Engine Responsibilities

WorkflowEngine coordinates:

```text
validated workflow
run creation/resume
scheduler readiness
node-handler dispatch
durable transitions
context/profile/skill resolution orchestration
budget enforcement orchestration
runtime/executor orchestration
supervision outcomes
artifact/evidence persistence
gate evaluation
human waiting states
failure/recovery policy
downstream invalidation
events
```

It does not implement provider-specific behavior.

---

# 80. Event

```ts
interface WavesEvent<T = unknown> {
  id: string;
  type: string;
  timestamp: Date;

  workflowRunId?: WorkflowRunId;
  nodeRunId?: NodeRunId;

  payload: T;
}
```

Events are the common boundary for durable history, read models,
telemetry, and integrations.

---

# 81. State Store

```ts
interface StateStore {
  tasks: TaskRepository;
  workflowRuns: WorkflowRunRepository;
  nodeRuns: NodeRunRepository;
  approvals: ApprovalRepository;
  workflowMemory: WorkflowMemoryStore;
  artifacts: ArtifactStore;
  evidence: EvidenceStore;
  agentExecutions: AgentExecutionStore;
  events: EventStore;
}
```

SQLite is the MVP implementation, not a domain dependency.

---

# 82. Deployment Provider

```ts
interface DeploymentProvider {
  plan(request: DeploymentPlanRequest): Promise<DeploymentPlan>;

  deploy(request: DeploymentRequest): Promise<DeploymentResult>;

  status(reference: DeploymentReference): Promise<DeploymentStatus>;

  capabilities(): Promise<DeploymentCapabilities>;
}
```

Deployment is an external side effect, not a Runtime.

---

# 83. Deployment Reference

```ts
interface DeploymentReference {
  provider: ProviderId;
  externalId: string;

  environment: string;
  releaseId?: string;
  changeId?: string;

  startedAt?: Date;
  metadata?: Record<string, unknown>;
}
```

---

# 84. Rollout Observation Provider

```ts
interface RolloutObservationProvider {
  observe(request: RolloutObservationRequest): Promise<RolloutObservation>;
}
```

Observation should prefer deterministic provider signals when available.

---

# 85. Rollout Supervisor

```ts
interface RolloutSupervisor {
  supervise(request: RolloutSupervisionRequest): Promise<RolloutSupervisionResult>;
}
```

```ts
type RolloutOutcome = "HEALTHY" | "REGRESSION" | "TIMED_OUT" | "AMBIGUOUS" | "FAILED";
```

Deployment accepted/started is distinct from rollout healthy/completed.

---

# 86. Production Signal Provider

```ts
interface ProductionSignalProvider {
  query(request: ProductionSignalQuery): Promise<ProductionSignal[]>;

  health(): Promise<ProviderAvailability>;
}
```

---

# 87. Production Signal

```ts
interface ProductionSignal {
  id: string;
  source: ProviderId;

  type: "performance-regression" | "error-spike" | "incident" | "health-degradation" | "custom";

  severity: string;

  observedAt: Date;
  externalReference?: string;

  correlation?: {
    deploymentId?: string;
    releaseId?: string;
    workflowRunId?: WorkflowRunId;
  };

  deduplicationKey?: string;
  summary?: string;
  evidence?: ArtifactReference[];
}
```

Raw production payloads are not copied into generic state by default.

---

# 88. Observability Boundary

```ts
interface TelemetryExporter {
  export(event: WavesEvent): Promise<void>;
  health(): Promise<ProviderAvailability>;
}
```

Exporter failure is isolated from engineering correctness.

---

# 89. Read Models

Presentation consumes query/read models rather than engine internals.

```ts
interface GraphViewModel {
  runId: WorkflowRunId;
  nodes: GraphNodeView[];
  edges: GraphEdgeView[];
  waves?: WaveView[];
}

interface RunSummaryView {
  runId: WorkflowRunId;
  status: WorkflowRunStatus;
  completedNodes: number;
  totalNodes: number;

  currentWave?: number;
  activeParallelism?: number;

  usage?: UsageAggregate;
  budget?: BudgetState;
}
```

CLI and TUI may share these read models.

---

# 90. Composition Root

Concrete applications assemble implementations:

```ts
const waves = createWaves({
  configurationResolver,
  providerRegistry,
  agentRegistry,
  skillResolver,
  contextResolver,

  stateStore,
  artifactStore,
  evidenceStore,

  scheduler,
  budgetEvaluator,
  executionSupervisor,

  workspaceStrategies,
  runtimes,
  executors,

  nodeHandlers,
  gates,
});
```

Optional integrations register behind the same provider/capability
model.

---

# 91. Contract Relationships

```text
TaskContext
    │
    ├── ProjectContextSnapshot
    ├── ResolvedConfig / Policy
    └── RunEntryPoint
            │
            ▼
     WorkflowDefinition
            │
            ▼
      WorkflowEngine
            │
            ▼
        Scheduler
            │
            ▼
       Node Handler
            │
     ┌──────┴─────────┐
     ▼                ▼
deterministic      AgentNode
node               │
                   ▼
             BudgetEvaluator
                   │
                   ▼
             ContextResolver
                   │
                   ▼
        Workspace/Runtime/Executor
                   │
                   ▼
          AgentExecutionResult
                   │
                   ▼
          ExecutionSupervisor
                   │
                   ▼
          Artifacts / Evidence
                   │
                   ▼
        Risk / Gates / Review
                   │
                   ▼
          Scheduler / Recovery
```

---

# 92. Final Contract Principle

The core contracts exist to prevent convenience features from becoming
architectural shortcuts.

Full workflows, partial workflows, standalone agents, low-cost
configurations, optional external memory, external context, parallel
workers, TUI, delivery integrations, and production workflows all
compose the same durable execution model.

No feature may bypass the core guarantees of:

```text
validated configuration
policy
permissions
budget
durable state
truthful provenance
structured output validation
execution supervision
evidence
human control where required
explicit recovery semantics
```
