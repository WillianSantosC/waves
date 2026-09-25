# Waves --- Architecture v0.1

## 1. Objective

Waves is a vendor-agnostic orchestration platform for AI-assisted
software engineering.

The architecture is designed so that workflow semantics remain stable
while providers, models, runtimes, workspace strategies, memory
implementations, integrations, and user interfaces evolve independently.

The core architectural rule remains:

> **Agents execute work. Waves owns the engineering process.**

Version 0.3 consolidates the configuration, provider registry, bounded
context, cost/budget, supervision, recovery, partial execution,
risk-aware review, external context, and optional production-feedback
decisions made after v0.2.

---

# 2. Architectural Invariants

## 2.1 Separation of WHAT / WHO / WHERE / HOW

```text
WHAT   = Task + Workflow + Node + Artifact
WHO    = Agent Profile + Skills
WHERE  = Workspace + Runtime
HOW    = Executor + Model
```

Constraints and knowledge are orthogonal:

```text
CONSTRAINTS = Configuration + Policy + Permissions + Budget
KNOWLEDGE   = Project Context + Workflow Memory + Project Memory + External Context
PROOF       = Supervision + Evidence + Gates + Human Review
RECOVERY    = Failure Policy + Recovery Policy + Checkpoints + Compensation
```

No provider-specific implementation may collapse these boundaries in
core domain contracts.

## 2.2 Vendor Agnostic

The core depends on provider-neutral contracts and capability queries.

Concrete Claude, Codex, Orca, GitHub, Linear, OpenTelemetry, ai-memory,
deployment, or context-source behavior belongs in adapters/providers.

## 2.3 Determinism Over Agents

Deterministic software is preferred for repository discovery, graph
validation, state transitions, command execution, hashes, permission
checks, context bounding, budget evaluation, evidence, and common risk
signals.

LLMs are used for interpretation and generation where deterministic
logic is insufficient.

## 2.4 Structured Context, Not Artifact-Only Handoffs

Artifacts remain durable and auditable but are not the default transient
communication channel.

Workflow Memory carries structured run-scoped working knowledge. Context
Projection selects the minimum effective context for a node.

Artifacts are reserved for durable contracts, evidence, deliverables,
decisions, review records, and audit data.

## 2.5 Durable Execution

Workflow correctness and recovery depend on persisted Waves state.

Provider session/thread continuity is optional optimization metadata. A
run must remain resumable when that continuity is absent, stale, or
rejected.

## 2.6 Human Controllability

Approvals bind to immutable snapshots and artifact versions.

Human input, rejection feedback, approval decisions, and cancellation
are durable engine operations.

## 2.7 Least Privilege

Agent capabilities describe what a role can conceptually do. Effective
permissions describe what this execution may do.

Permission escalation cannot occur through a lower-authority
workflow/node override.

## 2.8 Cost-Aware by Construction

BudgetPolicy is evaluated before paid model execution.

Optional reasoning may be reduced by policy; deterministic correctness
mechanisms remain active.

---

# 3. High-Level Architecture

```text
                         User
                          │
                          ▼
                     Waves CLI/TUI
                          │
                          ▼
                  Application Services
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
 Configuration       Task Resolution    Read Models
 Resolver/Policy           │                 │
        │                  ▼                 │
        │          Workspace Resolution      │
        │                  │                 │
        │                  ▼                 │
        │          Project Discovery         │
        │                  │                 │
        │                  ▼                 │
        │          Project Context Store     │
        │                  │                 │
        └──────────────┬───┴─────────────────┘
                       ▼
                Workflow Preparation
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    Workflow Loader  Agent/Skill   Provider/
      & Validator     Registry     Capability Registry
          │            │            │
          └────────────┼────────────┘
                       ▼
                 Workflow Engine
                       │
          ┌────────────┼──────────────┐
          ▼            ▼              ▼
      Scheduler     State Store    Policy/Gates
          │
          ▼
      Node Handler Registry
   ┌──────┼────────┬─────────┐
   ▼      ▼        ▼         ▼
 Agent  Command   Human     Gate
   │
   ▼
Budget Evaluator
   │
   ▼
Context Resolver / Projection
   │
   ▼
Workspace + Runtime + Executor
   │
   ▼
AgentExecutionResult
   │
   ▼
Execution Supervisor
   │
   ├── Workflow Memory writes
   ├── Artifact candidates
   ├── observable side effects
   └── scope-deviation findings
   │
   ▼
Evidence / Risk / Review
   │
   ▼
Next scheduler decision
```

Optional provider families attach around these stable boundaries:

```text
Project Memory
External Context Sources
Evidence/Security
Observability
Task Sources
Review/Delivery
Deployment/Rollout
Production Signals
```

---

# 4. Monorepo Structure

Recommended package boundaries:

```text
waves/
├── apps/
│   └── cli/
├── packages/
│   ├── core/
│   ├── config/
│   ├── workflow/
│   ├── context/
│   ├── memory/
│   ├── state/
│   ├── artifacts/
│   ├── executors/
│   ├── runtimes/
│   ├── workspaces/
│   ├── evidence/
│   ├── review/
│   ├── skills/
│   ├── providers/
│   ├── observability/
│   └── integrations/
├── workflows/
│   └── builtin/
├── skills/
│   └── builtin/
└── docs/
    ├── architecture/
    └── adr/
```

Packages should be introduced when behavior exists; empty speculative
interfaces are avoided.

---

# 5. Configuration Architecture

## 5.1 One Resolver

No subsystem reads YAML/environment/provider options independently.

All execution-facing components consume a validated `ResolvedConfig`
with provenance.

## 5.2 Layers

Normal precedence:

```text
built-in defaults
    ↓
user config
    ↓
project config
    ↓
profile/workflow/node overrides
    ↓
CLI overrides
```

Mandatory project/organization policy forms a constraint boundary and
cannot be weakened by lower-authority values.

## 5.3 Ownership

User configuration contains personal defaults and UI preferences.

Project configuration contains shared execution behavior: commands,
workflows, policies, context, evidence, memory behavior, integrations,
and project Agent Profile overrides.

## 5.4 Secrets

Committed configuration stores secret references, never raw credentials
by default.

## 5.5 Run Snapshot

At run start, Waves persists enough effective configuration
identity/provenance to explain and reproduce the execution even if
user/project configuration later changes.

## 5.6 Setup and Diagnostics

`waves setup`, `waves config`, and `waves doctor` are different surfaces
over the same schemas and registries.

- setup chooses/writes configuration;
- config inspects/changes/explains it;
- doctor verifies that the resolved configuration is operational.

Presets such as `cost-conscious`, `balanced`, `quality-focused`, or
`safe-autonomous` materialize normal configuration values. They are not
hidden engine modes.

---

# 6. Provider and Capability Registry

Providers register descriptors rather than teaching the core their
names.

A descriptor includes:

```text
id
category
version/compatibility
human metadata
configuration schema
capabilities
availability/health
setup metadata
diagnostic metadata
```

Provider health states should distinguish at least:

```text
available
unavailable
misconfigured
unsupported-version
unsupported-capability
optional-not-installed
```

A configured required provider fails preflight if unavailable. Optional
unavailable providers degrade only the optional capability.

Provider categories are extensible and initially cover:

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

WorkspaceStrategy is normally Waves-owned, not an external provider, but
compatibility is still capability-validated.

---

# 7. Workspace, Runtime, and Executor

## 7.1 WorkspaceStrategy

Answers where repository changes are materialized.

Initial/future strategies:

```text
current
worktree
```

## 7.2 AgentRuntime

Answers where/how the execution process is hosted.

Examples:

```text
LocalRuntime
OrcaRuntime
CIRuntime
RemoteRuntime
```

## 7.3 AgentExecutor

Answers which AI CLI/provider/model performs the agent execution.

Examples:

```text
FakeAgentExecutor
ClaudeExecutor
CodexExecutor
```

## 7.4 Compatibility

A valid execution requires compatible capabilities across
WorkspaceStrategy, Runtime, Executor, permissions, and node
requirements.

`LocalRuntime` does not imply an unisolated workspace.

Orca is an optional worker/isolation runtime only. Waves retains DAG
scheduling, approvals, retries, evidence, memory, and durable state.

---

# 8. Project Discovery and Project Context

Project Discovery deterministically inspects repository facts such as:

```text
AGENTS.md
CLAUDE.md
CONTEXT.md
.cursor/rules/
.github/copilot-instructions.md
README/docs/architecture/ADR
package manifests
Docker/CI metadata
skill locations
project commands
```

The result becomes a versioned `ProjectContextSnapshot` with source
fingerprints and repository revision where available.

Generated Markdown such as `.waves/generated/project-context.md` is a
human-readable projection, not the machine source of truth.

---

# 9. Context and Memory Taxonomy

## 9.1 Project Context

Current repository facts.

## 9.2 Workflow Memory

Mutable structured knowledge scoped to one WorkflowRun and owned by
Waves.

Approval-relevant memory is frozen into immutable snapshots.

## 9.3 Project Memory

Curated reusable cross-run knowledge behind `ProjectMemoryProvider`.

The native provider is the dependable default. External providers are
optional.

## 9.4 Agent Handoff

Typed cross-agent handoff may be provided by an optional provider. It
never replaces Workflow Memory or durable run state.

## 9.5 Provider Session Memory

Opaque provider session/thread references are continuity optimizations
only.

## 9.6 Artifacts

Artifacts represent durable engineering records with purpose such as:

```text
contract
evidence
deliverable
audit
```

---

# 10. Context Projection

The Context Resolver builds `EffectiveAgentContext` from selected
sources.

```text
Task Context
+ Project Context
+ Workflow Memory
+ Project Memory recall
+ external context
+ artifacts/contracts
+ Agent Profile
+ Skills
+ node/workflow hints
        ↓
deterministic filter/dedupe/rank
        ↓
budget enforcement
        ↓
Effective Agent Context
```

Context tiers should distinguish required, relevant, and optional
material.

Mandatory context is never silently dropped. If required context alone
exceeds a hard budget, execution fails clearly.

Project Memory and external context have independent bounds so optional
sources cannot consume the entire node budget.

Model-assisted summarization/ranking is optional and occurs only after
deterministic bounding.

Every included/excluded/truncated resource preserves safe provenance.

---

# 11. External Context Sources

`ContextSourceProvider` allows bounded retrieval from systems outside
the repository.

Provider results include source reference/URI, type/title, provenance,
freshness metadata when available, and bounded content.

MCP may back a provider but is not mandatory.

Access is permission/policy controlled per role/node. Retrieved content
passes through Context Projection before reaching an executor.

Optional source failure becomes degraded context unless the workflow
explicitly requires that source.

---

# 12. Agent Profiles and Skills

Agent Profiles describe reusable roles, not providers.

Profiles may declare:

```text
role/purpose
default permissions
context projection hints
runtime/executor preferences
required/preferred/disabled skills
execution expectations
```

Effective precedence is deterministic and lower-authority configuration
cannot expand permissions beyond policy.

Skills describe reusable capabilities/instructions/expectations. Skills
do not orchestrate the engine.

Interactive workflow skills are modeled as workflow behavior and may
enter durable `WAITING_INPUT`.

---

# 13. Workflow Definitions

Workflows are versioned declarative DAGs.

Supported node families include:

```text
agent
command
gate
human
nested-workflow
future provider-backed action nodes
```

Nodes may declare dependencies, conditions, context hints, permissions
restrictions, runtime/executor preferences, evidence requirements, retry
behavior, and policy references.

The engine does not special-case planner, test architect, developer,
reviewer, or the recommended TDD sequence.

---

# 14. Built-In Workflow Presets

The built-in registry provides stable references such as:

```text
builtin:tdd-feature
builtin:standard-feature
builtin:quick-change
```

The recommended TDD-oriented preset may contain task understanding,
planning, human plan review, Test Architect, human test review,
implementation, deterministic validation/evidence, risk assessment,
review/security, and final gating.

A non-TDD workflow is valid when higher-authority policy permits it.

---

# 15. Workflow Entry Points

## 15.1 Full Execution

Normal graph execution begins from graph roots.

## 15.2 Partial Execution

A `RunEntryPoint` may select a starting node and optionally a bounded
target/subgraph.

Upstream dependencies may be satisfied by explicit
`PrerequisiteSatisfaction` records backed by supplied artifacts,
memory/context, or policy-approved assumptions.

Omitted nodes are not recorded as successful executions.

The scheduler treats an external prerequisite as satisfied only when the
required contract is present, valid, current, and policy-permitted.

## 15.3 Standalone Agent/Node

Standalone execution is compiled into a minimal validated ad-hoc
workflow.

It uses the same WorkflowEngine, configuration, policies, budgets,
permissions, supervision, evidence, persistence, and recovery semantics.

---

# 16. Scheduler and Waves

The scheduler computes readiness from graph dependencies and persisted
node state.

It is role-agnostic.

A ready set is represented as an `ExecutionWave`.

MVP may execute a wave sequentially. Later `maxParallelism` enables
bounded concurrency without replacing scheduler semantics.

Parallel failures respect explicit policy such as `stopOnFailure`;
unrelated branches need not be blocked by a human-waiting node unless
dependencies require it.

---

# 17. Workflow and Node State

Workflow state is durable.

Representative WorkflowRun states:

```text
CREATED
RUNNING
WAITING_INPUT
WAITING_APPROVAL
FAILED
COMPLETED
CANCELLED
```

Representative NodeRun states:

```text
PENDING
READY
RUNNING
WAITING_INPUT
WAITING_APPROVAL
COMPLETED
FAILED
SKIPPED
INVALIDATED
CANCELLED
```

Externally satisfied prerequisites must remain distinguishable through
reason/provenance metadata even if `SKIPPED` is reused as the storage
status.

Every retry creates a new attempt. History is never overwritten.

---

# 18. Agent Execution Pipeline

A supervised AgentNode follows:

```text
resolve effective configuration
        ↓
resolve profile + skills
        ↓
resolve permissions
        ↓
resolve context projection
        ↓
evaluate budget
        ↓
resolve workspace/runtime/executor
        ↓
invoke executor
        ↓
validate structured output
        ↓
ExecutionSupervisor
        ↓
persist accepted memory/artifacts/findings
        ↓
evidence/gates
        ↓
scheduler
```

Executor success is transport/schema success, not engineering
acceptance.

---

# 19. Execution Supervisor

`ExecutionSupervisor` evaluates resolved execution expectations.

It may verify:

```text
required Workflow Memory writes
required artifact candidates
test-contract output
review decisions
created files
non-empty Git diff
expected deliverables
scope deviations against TaskImpactAssessment
```

Prose self-reporting is never proof of an observable side effect.

Supervision returns structured outcomes such as accepted, rejected, or
correction-required and does not itself decide retry policy.

Evidence Gates remain separate and evaluate broader engineering quality.

---

# 20. Artifacts and Evidence

Artifacts are immutable/versioned conceptually and preserve producer,
purpose, location, content hash, and dependencies.

Evidence is proof about an observable result and may reference
artifacts.

Initial evidence includes:

```text
command-result
git-diff
test-output
build-output
lint-output
typecheck-output
http-response
screenshot
browser-flow
security-scan
```

A failed command is still valid evidence of what occurred. Evidence
existence does not imply gate success.

---

# 21. TDD Contract

TDD is a workflow/policy contract, not a WorkflowEngine invariant.

In a TDD workflow, approved test contracts are immutable inputs to
implementation.

Unauthorized modification produces a contract failure such as:

```text
TEST_CONTRACT_CONFLICT
```

The implementation agent cannot silently change its own acceptance
ruler.

Other workflows may omit TDD when policy permits.

---

# 22. Human Review and Approval

Agents produce structured `HumanReviewModel` data.

Renderers transform it into Markdown/TUI/Web representations.

Approval binds to an immutable MemorySnapshot and optional artifact
versions.

Changing approved content invalidates the approval.

Rejection creates a new attempt/lineage while preserving prior versions
and feedback.

---

# 23. Budget and Cost Architecture

## 23.1 BudgetPolicy

Budget may exist at run and node/agent scope and constrain tokens and
optional monetary cost.

## 23.2 Accounting

Agent execution records may contain:

```text
input tokens
output tokens
total tokens
cached/reused input tokens
estimated cost
currency
cost/usage provenance
unknown/unsupported markers
```

Provider-specific price tables stay outside core contracts.

## 23.3 Pre-Execution Evaluation

Before every paid AgentNode call, `BudgetEvaluator` considers:

```text
observed usage
remaining limits
projected context
projected output bound
selected executor/model capabilities
configured actions
```

## 23.4 Actions

Explicit policy may select:

```text
continue
warn
pause
stop
reduce-context
use-compatible-lower-cost-model
skip-optional-stage
require-approval
```

Model fallback is never silent and requires explicit authorization plus
capability compatibility.

Skipping is permitted only for stages explicitly marked
optional/skippable and not required by higher-authority policy.

Retries consume the same run budget.

---

# 24. Task Impact and Change Risk

## 24.1 TaskImpactAssessment

Pre-change assessment containing expected affected areas, relevant
tests/contracts, protected areas, risk, rationale, uncertainty, and
provenance.

Expected paths are not a rigid allowlist by default; unexpected changes
become scope-deviation signals.

## 24.2 ChangeRiskAssessment

Post-change assessment based on the actual implementation and evidence.

Deterministic signals include changed paths, diff size, protected areas,
dependency changes, migrations, infrastructure/config changes, security
findings, evidence gaps, scope deviations, and contract conflicts.

Agent-assisted risk classification is optional and cannot silently
override stronger deterministic/policy signals.

Policy maps risk to actions such as additional evidence, specialist
review, human review, stop, or auto-continue.

---

# 25. Failure Model

Failure categories describe what happened:

```text
OPERATIONAL
ENGINEERING
CONTRACT
SPECIFICATION
SECURITY
POLICY
```

The category does not dictate recovery by itself.

Operational retry counters and engineering retry counters remain
separate.

Repeated engineering failure may trigger specification review/rewrite
instead of blind implementation retries.

---

# 26. Recovery and Side-Effect Model

## 26.1 RecoveryAction

Representative actions:

```text
retry
stop
pause-human-review
continue-safe
degrade
rollback
compensate-if-supported
```

## 26.2 SideEffectClassification

Representative classes:

```text
read-only
local-reversible
external-reversible
external-compensatable
irreversible
unknown
```

Unknown reversibility is handled conservatively.

## 26.3 Crash Recovery vs Rollback

Crash recovery reconstructs persisted execution after interruption.

Rollback intentionally restores a prior workspace checkpoint.

They are different operations.

## 26.4 Compensation

External compensation is invoked only when the provider declares
support.

Unsupported, partial, or failed compensation must be surfaced truthfully
and may require human action.

---

# 27. Checkpoints and Workspace Rollback

After worktree isolation exists, a `CheckpointManager` may capture
attempt-scoped workspace checkpoints.

Recovery policy may restore a failed/rejected attempt before retrying so
attempts do not stack on invalid partial changes.

Checkpoint identity and recovery outcomes are durable audit data.

Rollback does not reset token/cost budgets.

---

# 28. Review Reconciliation

External/AI review findings do not automatically become repair tasks.

```text
Review Finding
      ↓
Reconciliation
      ↓
Current code/evidence inspection
      ├─ false positive → discard
      ├─ obsolete       → discard/archive
      ├─ confirmed      → correction request
      └─ ambiguous      → human/reviewer judgment
```

Deterministic reproduction is preferred before another model call.

---

# 29. State Store and Persistence

SQLite through `bun:sqlite` is the MVP durable store.

Persisted concepts include at least:

```text
tasks
workflow_runs
node_runs
approvals
workflow_memory
memory_snapshots
agent_executions
artifacts
evidence
events
configuration/run snapshots
budget/accounting decisions
```

Larger artifact content may live in the filesystem while metadata
remains in SQLite.

Domain packages do not depend on SQLite directly.

---

# 30. Event System

Important transitions emit structured events.

Examples:

```text
workflow.started
node.ready
node.started
agent.execution.completed
agent.supervision.rejected
artifact.created
evidence.collected
approval.waiting
approval.approved
budget.warning
budget.execution-denied
recovery.rollback.started
recovery.compensation.failed
risk.assessed
wave.started
wave.completed
workflow.completed
```

Events support CLI/TUI read models, telemetry, integrations, and
historical analysis without moving orchestration logic into
presentation.

---

# 31. Observability

Waves records safe execution metadata such as:

```text
run/workflow/node IDs
agent role
runtime
executor/model
duration
attempt/retry count
context budget metadata
token usage
estimated cost
failure category
wave index
```

Raw prompts, model responses, secrets, environment values, repository
contents, and arbitrary memory are excluded by default.

OpenTelemetry is an optional exporter behind the provider registry.
Exporter failure never becomes an engineering failure.

---

# 32. TUI Architecture

The TUI is a presentation surface over persisted state/read models.

```text
State + Events + Telemetry
          ↓
      Query Layer
          ↓
      View Models
          ↓
          TUI
```

The TUI may invoke existing durable operations such as
approve/reject/cancel but cannot implement scheduler/state-machine logic
locally.

CLI remains scriptable and fully supported.

---

# 33. External Task, Review, and Delivery Integrations

Task providers normalize external issues into provider-neutral
`TaskContext`.

Review providers normalize findings before reconciliation.

Delivery providers act only after the configured engineering gates and
policy permit delivery.

GitHub/Linear/Jira-like systems remain optional adapters.

---

# 34. Deployment and Production Architecture

Production capabilities are post-MVP and optional.

## 34.1 Deployment Providers

Deployment/release providers are external action providers, not
AgentRuntimes.

They expose deployment references, environment identity, status, safe
metadata, permissions, and side-effect/recovery capabilities.

## 34.2 Risk-Aware Release

Deployment nodes consume prerequisite evidence and
`ChangeRiskAssessment`.

Sensitive/irreversible environments/actions may require explicit
approval.

Dry-run/plan-only behavior should be supported.

## 34.3 Rollout Supervisor

Deployment acceptance is distinct from rollout health.

`RolloutSupervisor` observes configured success/failure signals for an
observation window and integrates with RecoveryPolicy.

## 34.4 Production Signals

Production signals normalize performance regressions, errors/incidents,
health degradation, and custom alerts.

Signals preserve provenance, severity, deduplication/correlation
metadata, and safe evidence.

Policy may record, request human triage, create remediation candidates,
or start a configured workflow.

## 34.5 Remediation

Operational investigation uses bounded external context and normal
WorkflowDefinition semantics.

Production mutation remains separately permissioned and human/policy
gated.

Lineage should preserve:

```text
production signal
  → investigation
  → remediation/fix task
  → deployment
  → rollout outcome
```

---

# 35. What Does Not Belong in WorkflowEngine

WorkflowEngine must not:

```text
parse Claude/Codex syntax
know Orca commands
read YAML directly
discover repository architecture itself
fetch Linear/GitHub/Jira directly
take screenshots directly
run Jest specifically
calculate vendor pricing directly
query MCP sources directly
implement TUI state
deploy to a concrete cloud
interpret provider-specific compensation
```

Those responsibilities belong to resolvers, handlers, providers,
adapters, stores, or presentation layers.

WorkflowEngine coordinates validated definitions and durable state.

---

# 36. MVP Boundary

The MVP includes the stable foundations required before advanced
autonomy:

- Bun/TypeScript monorepo and deterministic quality gates;
- repository/workspace identity;
- versioned layered configuration;
- provider/capability registry;
- configurable workflow definitions and built-in presets;
- deterministic project discovery and Project Context;
- Agent Profiles and skill bindings;
- BudgetPolicy contracts;
- core state machines and scheduler;
- failure/recovery/side-effect contracts;
- partial workflow entry contracts;
- SQLite durable state;
- Workflow Memory and immutable snapshots;
- human review/approval;
- bounded Context Projection and TaskImpactAssessment;
- provider-neutral execution contracts and FakeAgentExecutor;
- usage/cost accounting and budget enforcement;
- ExecutionSupervisor;
- generic WorkflowEngine and CommandNodes;
- artifacts/evidence and TDD contract protection;
- LocalRuntime and real Claude/Codex adapters;
- CLI for full, partial, and standalone execution;
- diagnostics, telemetry, recovery tests, and documentation.

---

# 37. Post-MVP Evolution

Later phases add:

- Git worktree isolation;
- checkpoints/rollback and external compensation;
- richer evidence/security;
- ChangeRiskAssessment and risk-aware review;
- nested workflows and interactive skills;
- autonomy modes;
- bounded parallel waves;
- multi-task DAGs;
- OrcaRuntime;
- external task/context/review/delivery providers;
- native and optional external Project Memory/handoff;
- historical relationship indexing and optional knowledge graph;
- workflow optimization/model performance analysis;
- OpenTelemetry;
- interactive TUI;
- optional deployment, rollout supervision, production signals, and
  remediation workflows.

---

# 38. Final Architectural Principle

Waves owns process truth.

Agents may reason, generate, inspect, and propose. Providers may execute
specialized capabilities. Humans may approve or reject. External systems
may supply context or perform explicitly authorized side effects.

But the durable workflow, policies, budgets, permissions, evidence,
provenance, and recovery semantics remain owned by Waves.
