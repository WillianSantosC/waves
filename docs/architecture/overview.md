# Waves

## 1. Overview

Waves is a vendor-agnostic orchestration system for AI-assisted software
engineering workflows.

Its purpose is not to replace coding agents. Agents perform bounded
engineering work; Waves owns the engineering process around them:
configuration, workflow state, context, permissions, budgets, execution
supervision, evidence, approvals, recovery, auditability, and optional
delivery/production feedback.

> **Agents execute work. Waves owns the engineering process.**

Waves is designed to work with different AI CLIs, models, runtimes,
workspace strategies, memory providers, evidence providers,
integrations, and future execution backends without making any one
provider part of the core workflow model.

---

## 2. What Waves Should Support

Waves should support:

- one ad-hoc task;
- configurable single-task workflows;
- partial workflow execution from a selected node;
- standalone agent/node execution through the normal engine;
- multiple tasks with dependencies;
- DAGs with branching and convergence;
- bounded parallel execution in waves;
- deterministic command and gate nodes;
- human checkpoints and durable input states;
- manual, assisted, and autonomous execution policies;
- local and isolated workspaces;
- interchangeable runtimes and executors;
- structured run memory and durable artifacts;
- bounded project and external context;
- token/cost budgets before model calls;
- evidence-driven validation;
- explicit failure/recovery semantics;
- optional delivery, deployment, rollout, and production-feedback
  workflows.

The system must remain useful without optional integrations. A
repository with Git, local project commands, SQLite state, and one
compatible executor should be enough for the core experience.

---

## 3. Core Philosophy

Waves separates the engineering process into stable concerns:

```text
WHAT
Workflow / Task / Node / Artifact

WHO
Agent Profile / Skills

WHERE
Workspace / Runtime

HOW
Executor / Model

UNDER WHAT CONSTRAINTS
Configuration / Policy / Permissions / Budget

WITH WHAT KNOWLEDGE
Project Context / Workflow Memory / Project Memory / External Context

HOW WE KNOW IT WORKED
Execution Supervision / Evidence / Gates / Human Review

HOW WE RECOVER
Failure Policy / Recovery Policy / Checkpoints / Compensation
```

None of these choices should be permanently coupled to the others.

A Developer profile may execute with Codex today and Claude tomorrow.
The same workflow may run in the current checkout or an isolated
worktree. A Project Memory provider may be native or external. Those
changes must not redefine workflow semantics.

---

## 4. Main Engineering Principles

### 4.1 Vendor-Agnostic Core

The core knows contracts and capabilities, not Claude, Codex, Orca,
GitHub, Linear, OpenTelemetry vendors, or memory products.

Concrete implementations register behind provider/adapter boundaries.

### 4.2 Structured Context, Memory, and Durable Artifacts

Waves is **not artifact-only**.

The default knowledge path is:

```text
Project Context
+ Workflow Memory
+ selected Project Memory
+ selected external context
+ required artifacts/contracts
        ↓
Context Projection
        ↓
Effective Agent Context
```

Workflow Memory is the primary run-scoped working channel. Durable
artifacts are created when durability has value: approved contracts,
evidence, deliverables, diffs, screenshots, review records, ADRs, or
audit records.

This avoids repeatedly serializing every intermediate thought into
Markdown merely so another agent can read it.

### 4.3 Evidence Over Self-Reporting

An executor returning successfully does not mean the engineering work is
acceptable.

Waves distinguishes:

```text
executor completed
        ↓
structured result valid
        ↓
Execution Supervisor accepts required deliverables/side effects
        ↓
deterministic evidence/gates pass
        ↓
workflow may advance
```

A Developer saying "implemented" is not proof of a code change. A test
output, Git diff, build result, HTTP response, screenshot, security
scan, or other observable evidence can be.

### 4.4 Determinism Before Agent Reasoning

When software can answer a question reliably, Waves should use software.

Examples include:

- Git repository discovery;
- DAG validation and cycle detection;
- command execution;
- state transitions;
- hashing/versioning;
- context deduplication and budget enforcement;
- test/build/lint/typecheck execution;
- permission preflight;
- evidence evaluation;
- provider capability checks;
- token/cost accounting when exposed by providers;
- risk signals such as changed protected paths or migrations.

Agent reasoning is used where interpretation adds value.

### 4.5 Configurable Workflows, Opinionated Presets

The recommended Waves engineering process is a built-in workflow preset,
not hard-coded engine behavior.

A project may choose a TDD-oriented workflow, a simpler quick-change
flow, or a custom DAG. TDD, planning, architecture review, security
review, and human approvals are workflow/policy choices unless a
higher-authority policy requires them.

### 4.6 Human Controllability

Human decisions are durable operations over exact versions of structured
state.

Approvals bind to immutable snapshots/artifact versions. Rejection
feedback is persisted. Closing the CLI must not lose a pending decision.

### 4.7 Durable Execution

Workflow truth belongs to Waves, not an AI session.

A provider session/thread may be reused as an optimization, but process
restart or provider-session loss must be recoverable from persisted
Waves state and reconstructed context.

### 4.8 Least Privilege

Capabilities are not permissions.

A CLI may support filesystem writes, shell, network, Git, MCP, or
external integrations; a specific agent execution receives only the
permissions allowed by effective policy.

### 4.9 Bounded Context

More context is not automatically better.

Context Projection must preserve required material first, then relevant
material, then optional material, within explicit size/token budgets.
Optional memory or external sources cannot silently consume the entire
input budget.

### 4.10 Cost Is an Execution Constraint

Cost is not only post-run telemetry.

Before each paid model invocation, Waves should evaluate known usage,
remaining budget, projected context/output bounds, selected
executor/model capabilities, and configured BudgetPolicy.

Cost-saving actions may reduce optional reasoning, context, or skippable
stages, but must not disable durable state, permissions, output
validation, deterministic tests, evidence, or contract enforcement.

### 4.11 Explicit Recovery Semantics

Failure classification and recovery action are separate.

An operational failure may retry. A contract failure may stop. An
optional telemetry failure may degrade safely. A failed isolated attempt
may roll back. An external action may require compensation or human
intervention.

Waves must never claim an irreversible or unsupported external action
was undone.

---

## 5. Configuration Model

Waves uses one versioned configuration system with deterministic
precedence and provenance.

Normal configuration resolution is conceptually:

```text
built-in defaults
    ↓
user configuration
    ↓
project configuration
    ↓
workflow/profile/node overrides
    ↓
CLI overrides
```

Higher-authority mandatory policy is not simply another preference layer
and cannot be silently weakened by a lower-authority override.

Configuration is expected to cover stable domains such as:

- project/repository identity;
- commands;
- context and context budgets;
- skills and Agent Profiles;
- workflow selection;
- WorkspaceStrategy, Runtime, Executor/model;
- parallelism, timeout, cancellation, and resource limits;
- approvals/autonomy;
- failure/recovery behavior;
- evidence/security;
- Project Memory and agent handoff;
- observability;
- external task/context/review/delivery providers;
- UI/TUI preferences.

Provider-specific options remain behind registered provider schemas.
Secrets are referenced, not serialized into committed project
configuration.

`waves setup`, `waves config`, and `waves doctor` consume the same
schemas, provider registries, and capability contracts.

---

## 6. Provider and Capability Model

Adapters register through a provider-neutral registry.

A provider descriptor communicates:

```text
stable ID
category
version/compatibility
configuration schema
capabilities
availability/health
setup metadata
diagnostic metadata
```

Initial categories include executors, runtimes, Project Memory, agent
handoff, evidence/security, observability, external task sources,
external context sources, review/delivery integrations, and later
deployment/production providers.

Optional unavailable providers do not block Waves startup. A configured
required provider must fail preflight clearly when unavailable or
incompatible.

WorkspaceStrategy remains a Waves-owned strategy where appropriate,
while compatibility with runtimes/executors is still
capability-validated.

---

## 7. Context and Memory Model

Waves distinguishes four concepts:

```text
Project Context
Current repository facts discovered/versioned by Waves.

Workflow Memory
Mutable run-scoped working knowledge owned by Waves.

Project Memory
Curated reusable cross-run knowledge behind a provider-neutral interface.

Artifacts
Durable contracts, evidence, deliverables, decisions, and audit records.
```

External ContextSourceProviders may add bounded context from systems
such as issue trackers, source control, documentation, chat/search,
observability, or internal services.

Every external result passes through the same permissions, provenance,
deduplication, and token-budgeted Context Projection used for repository
and memory context.

Provider-native session memory is optional continuity metadata, never
workflow truth.

---

## 8. Execution Modes

Waves exposes multiple entry modes without creating multiple engines.

```text
Full Workflow
Partial Workflow
Standalone Agent/Node
        │
        └──────────────┐
                       ▼
                WorkflowEngine
```

### Full workflow

```bash
waves task "Implement SSE streaming"
```

Waves resolves the configured/default workflow and executes it normally.

### Partial workflow

```bash
waves task ./issue.md \
  --from implementation \
  --input plan=./plan.json
```

Upstream work that did not execute is never marked as completed by
Waves. Required upstream contracts are represented as externally
satisfied prerequisites with provenance/hash/version where applicable.

Mandatory policies, budgets, permissions, approvals, protected
contracts, and downstream evidence still apply.

### Standalone agent/node

```bash
waves agent run reviewer --instructions "Review the current diff"
```

Standalone execution compiles to a minimal validated ad-hoc workflow and
passes through the same configuration, permissions, context, budget,
supervision, evidence, persistence, and failure semantics.

It is a convenience surface, not a privileged shortcut.

---

## 9. Typical Recommended Flow

A strong built-in TDD-oriented workflow may look like:

```text
Task
 ↓
Project/Task Understanding
 ↓
Planning
 ↓
Human Plan Review
 ↓
Test Architect
 ↓
Human Test Review
 ↓
Implementation
 ↓
Execution Supervision
 ↓
Deterministic Validation / Evidence
 ↓
Change Risk Assessment
 ├─ low risk ───────────────→ Final Gate
 ├─ medium risk → Review ───→ Final Gate
 └─ high risk ──┬→ Specialist/Security Review
                └→ Human Review
 ↓
Optional Delivery
```

This is a preset. A simpler workflow may intentionally omit planning,
TDD, or human review when policy permits.

The post-change `ChangeRiskAssessment` evaluates the implementation that
actually exists, not only the task as originally described.

---

## 10. Risk Model

Waves uses two related but distinct assessments.

`TaskImpactAssessment` is produced before implementation and describes
expected affected areas, relevant tests/contracts, protected areas,
uncertainty, and expected scope.

`ChangeRiskAssessment` is produced after implementation and considers
actual changes and deterministic signals such as:

- changed paths and diff size;
- protected/sensitive areas;
- dependency/lockfile changes;
- migrations;
- infrastructure/configuration changes;
- security findings;
- missing/failed evidence;
- scope deviations;
- test-contract conflicts.

Policy may route additional review, evidence, or approval based on the
resulting risk. Low risk never overrides mandatory policy or unresolved
security/contract failures.

---

## 11. Failure, Recovery, and Side Effects

Waves keeps three questions separate:

```text
What failed?
FailureCategory

What side effect may have happened?
SideEffectClassification

What should happen next?
RecoveryAction
```

Recovery actions include retry, stop/fail-fast, pause/human review,
continue-safe/degrade, rollback, and compensate-if-supported.

Side effects distinguish read-only, local/reversible,
external/reversible, external/compensatable, and irreversible behavior.

Crash recovery/resume is not rollback. Rollback is an intentional
recovery operation. External compensation is provider-declared and its
success must be verified.

Unknown reversibility is treated conservatively.

---

## 12. Budgets and Cost-Aware Execution

`BudgetPolicy` may constrain run-level and node/agent-level tokens and
optional monetary cost.

Waves distinguishes:

- observed usage;
- estimated future usage;
- configured limits;
- remaining known budget;
- unknown/unsupported usage;
- budget decisions.

Configured actions may include warning, pausing, stopping, reducing
optional context, selecting an explicitly allowed compatible lower-cost
model, skipping a workflow stage explicitly marked optional/skippable,
or requiring approval.

Retries consume the same run budget. A new attempt does not reset spend.

Pre-run estimates must communicate assumptions and uncertainty rather
than pretending to predict exact billing.

---

## 13. Runtime, Workspace, and Executor Independence

Workspace, Runtime, and Executor remain distinct.

```text
WorkspaceStrategy
Where repository changes are materialized.

AgentRuntime
Where/how the execution process is hosted.

AgentExecutor
Which AI CLI/provider/model performs the work.
```

Valid combinations may include:

```text
current + LocalRuntime + CodexExecutor
worktree + LocalRuntime + ClaudeExecutor
worktree + OrcaRuntime + CodexExecutor
```

Orca, if enabled, is an optional worker/isolation runtime. Waves
continues to own DAG scheduling, retries, approvals, evidence, memory,
and durable state.

---

## 14. Execution Supervision and Evidence

`AgentExecutionResult` proves only that the executor returned a
structurally valid result.

`ExecutionSupervisor` checks whether declared execution expectations
were actually satisfied: required memory writes, artifacts, review
decisions, test contracts, files, or observable repository changes.

Evidence Gates answer the broader question of engineering quality and
observable behavior.

This separation prevents provider transport success from becoming
workflow truth.

---

## 15. Human Review Experience

Human review consumes structured `HumanReviewModel` data and immutable
snapshots.

The CLI/TUI renders the model for inspection:

```text
Plan / Contract
Warnings
Relevant diff/evidence
Decision context
Exact snapshot/version
```

The renderer is presentation. Structured data remains the source of
truth.

---

## 16. Waves and Parallel Execution

The scheduler computes ready nodes from the DAG.

For:

```text
A ──► C
B ──► D
```

the first wave is `{A, B}` and the next may be `{C, D}`.

MVP execution may consume a ready wave sequentially. Later bounded
parallelism uses the same scheduler semantics with `maxParallelism`.

Multi-task execution extends the same concept to task-level dependency
graphs.

---

## 17. Observability and TUI

The core emits structured events and telemetry. UI surfaces consume read
models derived from persisted state.

```text
Persisted State + Events + Telemetry
              ↓
         Read Models
          ↙       ↘
        CLI       TUI
```

The TUI must not become a second scheduler or source of workflow truth.

Telemetry includes safe identifiers, duration, attempts, runtime,
executor/model, token usage and estimated cost when available, without
exporting prompts, secrets, raw repository content, or arbitrary memory
by default.

OpenTelemetry is an optional adapter.

---

## 18. Delivery and External Integrations

External systems provide tasks, context, evidence, review findings,
delivery actions, or production signals through adapters.

They do not own workflow execution.

Examples include:

- Linear/GitHub/Jira-like task sources;
- GitHub PR delivery;
- external review/security tools;
- MCP-backed context sources;
- observability exporters.

Review findings are reconciled against current code/evidence before
automatically generating correction work.

---

## 19. Deployment, Rollout, and Production Feedback

Production capabilities are optional and post-MVP.

The intended loop is:

```text
validated change
    ↓
ChangeRiskAssessment
    ↓
risk-aware release decision
    ↓
deployment
    ↓
rollout supervision
    ↓
production signals
    ↓
human/policy triage
    ↓
optional remediation workflow
```

Deployment is an external side effect, not an AgentRuntime.

A deployment provider accepting a request does not mean rollout
succeeded. `RolloutSupervisor` observes configured success/failure
signals and integrates with RecoveryPolicy.

Production signals should be normalized and deduplicated before optional
agent reasoning so Waves does not become an always-on token burner.

---

## 20. Initial Delivery Strategy

The MVP should prioritize the architecture that is expensive to change
later:

1.  repository and package foundation;
2.  layered configuration, provider/capability registry, workflows,
    Project Context, and BudgetPolicy;
3.  core domain, state machines, scheduler, failure/recovery contracts,
    and partial-entry semantics;
4.  durable SQLite state, Workflow Memory, snapshots, approvals;
5.  bounded Context Projection, TaskImpactAssessment, and skills;
6.  provider-neutral agent execution, accounting, budget enforcement,
    ExecutionSupervisor, artifacts, evidence, and generic
    WorkflowEngine;
7.  LocalRuntime plus real executor adapters;
8.  CLI surfaces including full, partial, and standalone execution;
9.  hardening, recovery tests, diagnostics, and documentation.

Advanced isolation, parallelism, external integrations, long-term
memory, TUI, and production workflows build on those contracts.

---

## 21. Final Principle

Waves should optimize **engineering confidence per token**, not agent
activity.

The system should spend model reasoning where reasoning adds value and
rely on deterministic software for correctness, safety, state, evidence,
budgets, permissions, and recovery.

> **Agents execute work. Waves owns the engineering process.**
