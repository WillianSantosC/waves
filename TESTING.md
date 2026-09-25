# Testing

## Overview

This document defines Waves' testing philosophy, architecture, conventions, and quality strategy.

The goal is to establish a consistent testing approach that provides high confidence while keeping the test suite deterministic, maintainable, understandable, and inexpensive to run.

Testing is treated as a first-class architectural concern. Every feature should be designed with testability in mind from the beginning rather than validated only after implementation.

Waves is an orchestration system built around durable state, workflow graphs, policies, provider boundaries, deterministic verification, and AI executors. Its testing strategy therefore prioritizes system invariants, observable behavior, recovery semantics, and provider-independent execution.

The default test suite must provide high confidence in Waves **without requiring network access, paid model calls, or external services**.

This document complements the architectural guidelines defined under `docs/architecture/`.

---

# Testing Philosophy

## Goals

The primary goal of the test suite is to increase confidence when changing the codebase.

Tests should help contributors:

- Detect regressions early.
- Refactor safely.
- Protect architectural invariants.
- Validate workflow and domain behavior.
- Validate failure and recovery semantics.
- Verify provider boundaries.
- Document expected behavior.
- Prevent accidental coupling between packages.
- Keep deterministic guarantees independent from AI behavior.
- Improve long-term maintainability.

Coverage is useful, but confidence is the real objective. Vitest coverage is a diagnostic signal, not a standalone quality target or gate unless a later project policy explicitly defines one.

A smaller suite of meaningful tests is preferred over a large suite of fragile tests.

---

## Core Principles

Every test in Waves should follow these principles:

- Test behavior instead of implementation details.
- Prefer observable outcomes over internal calls.
- Keep tests deterministic.
- Keep tests isolated.
- Make tests easy to understand.
- Minimize maintenance cost.
- Avoid unnecessary mocking.
- Prefer real local infrastructure when it is cheap and deterministic.
- Keep the feedback loop fast.
- Protect architectural invariants explicitly.
- Do not require live AI providers in normal test execution.
- Do not require external SaaS services in normal CI.
- Treat failures, retries, approvals, budgets, and recovery as first-class behaviors.
- Preserve test reproducibility across machines and execution order.

Whenever possible, tests should read as executable documentation describing how Waves behaves from a developer or user perspective.

---

## Confidence Over Coverage

Waves does not pursue code coverage as an objective by itself.

Coverage metrics are useful indicators, but they must not drive testing decisions.

A meaningful test suite focuses on validating:

- Domain rules.
- State-machine invariants.
- Workflow graph behavior.
- Scheduling rules.
- Policy precedence.
- Permissions.
- Budget enforcement.
- Failure classification.
- Recovery actions.
- Approval semantics.
- Context projection.
- Execution supervision.
- Provider contracts.
- Evidence gates.
- Persistence and recovery.
- CLI workflows.
- Critical edge cases.

Rather than simply increasing the percentage of covered lines.

Every new test should increase confidence in the system instead of merely improving a coverage report.

---

## Deterministic Infrastructure First

Waves should prefer real deterministic local infrastructure over mocks whenever practical.

Prefer:

```text

Real Git

Real SQLite

Real filesystem

Real child processes / commands

Real temporary repositories
```

Avoid by default:

```text

Live paid LLM calls

External SaaS services

Real production APIs

Network-dependent test fixtures

Shared mutable test infrastructure
```

A core architectural goal is that the orchestration engine can be validated independently from Claude, Codex, Orca, GitHub, Linear, or any other external provider.

---

# Testing Strategy

## Overview

Waves adopts a layered testing strategy.

Each layer has a specific responsibility and complements the others.

```text

               Real Provider Smoke Tests

         Claude / Codex / optional providers

────────────────────────────────────────────────

                  CLI End-to-End Tests

       Real Git + SQLite + commands + fake agents

────────────────────────────────────────────────

               Workflow End-to-End Tests

      WorkflowEngine + durable state + fake agents

────────────────────────────────────────────────

          Integration / Provider Contract Tests

 SQLite / Git / FS / runtime / adapters / providers

────────────────────────────────────────────────

              Domain / Unit / Property Tests

 state machines / DAG / policies / resolvers / rules

────────────────────────────────────────────────

            Architecture Boundary Tests

       package dependency and import invariants
```

Regression tests can exist at any layer.

Mutation testing is applied selectively to high-value deterministic modules.

The goal is not to maximize the number of tests at every layer.

Instead, each layer should validate the concerns that belong to it.

---

# Unit Tests

Unit tests validate individual pieces of functionality or domain behavior in isolation.

They should represent a large portion of the fast local test suite.

Typical examples include:

- Value objects.
- Domain entities.
- State transitions.
- Configuration merging.
- Policy evaluation.
- Schemas.
- Mappers.
- Parsers.
- DAG utilities.
- Budget calculations.
- Permission checks.
- Context filtering.
- Risk-signal evaluation.
- Failure classification.
- Recovery-policy decisions.

Unit tests should be:

- Fast.
- Deterministic.
- Independent.
- Easy to execute locally.
- Focused on public behavior.

Running the unit test suite must not require external infrastructure.

---

# State Machine Tests

State machines are a critical part of Waves and deserve explicit coverage.

Examples include:

- `WorkflowRun`.
- `NodeRun`.
- Approval state.
- Recovery state.
- Deployment / rollout state when introduced.
- Provider lifecycle state where applicable.

Tests should validate:

- Legal transitions.
- Illegal transitions.
- Terminal states.
- Idempotent operations.
- Repeated commands.
- Restart-compatible state.
- Attempt history.
- Invalidation behavior.
- Waiting states.
- Cancellation behavior.

Example:

```text

PENDING -> READY        valid

READY -> RUNNING        valid

RUNNING -> COMPLETED    valid

COMPLETED -> RUNNING    invalid

CANCELLED -> READY      invalid
```

Terminal-state protection is an architectural invariant and must be explicitly tested.

---

# DAG and Scheduler Tests

Workflow graph behavior must be validated independently from AI execution.

Tests should cover:

## Linear graphs

```text

A -> B -> C
```

## Branching graphs

```text

    B
   /
A
   \
     C
```

## Converging graphs

```text

B ─┐

   ├─> D

C ─┘
```

## Complex graphs

Tests should validate:

- Ready-node calculation.
- Blocked nodes.
- Dependency completion.
- Cycle detection.
- Missing dependencies.
- Self-dependencies.
- Deterministic ordering.
- Execution waves.
- Skipped nodes.
- Invalidated nodes.
- Human waiting states.
- Externally satisfied prerequisites.
- Failure propagation.
- Independent branches.
- Bounded parallelism when introduced.

The scheduler must remain role-agnostic.

Tests must never assume that a node is special because it is named `planner`, `developer`, `reviewer`, or similar.

---

# Property-Based Testing

Property-based testing should be used when correctness depends on invariants across a large input space rather than a small set of hand-picked examples.

Good candidates include:

- DAG scheduling.
- State transitions.
- Configuration precedence.
- Policy resolution.
- Budget arithmetic.
- Artifact invalidation.
- Dependency graphs.
- Retry accounting.
- Context-budget constraints.

Examples of useful properties:

```text

For every valid acyclic workflow:

- a node is never READY before its dependencies are satisfied;

- a terminal COMPLETED node never becomes READY again;

- every READY node has valid prerequisites;

- the scheduler never invents a node that does not exist.
```

```text

For every configuration layer combination:

- lower-authority configuration cannot weaken mandatory higher-authority policy;

- resolved provenance always points to the winning source.
```

```text

For every budget sequence:

- observed spend never decreases;

- remaining budget never increases after additional paid execution;

- retrying an agent does not reset run-level usage.
```

Property-based testing complements example-based tests. It does not replace them.

---

# Contract Tests

Provider and adapter boundaries should use reusable contract-test suites.

The purpose is to verify that multiple implementations obey the same semantics.

Examples include:

- `AgentExecutor`.
- `AgentRuntime`.
- `ProjectMemoryProvider`.
- `AgentHandoffStore`.
- `ContextSourceProvider`.
- `EvidenceProvider`.
- `DeploymentProvider`.
- `ProductionSignalProvider`.
- Delivery or review integrations.

Conceptually:

```ts

executorContractTests(() => new FakeAgentExecutor());

executorContractTests(() => new ClaudeExecutor(...));

executorContractTests(() => new CodexExecutor(...));
```

A shared executor contract suite may verify:

- Structured output behavior.
- Timeout behavior.
- Cancellation.
- Failure normalization.
- Capability reporting.
- Usage reporting.
- Optional session continuity.
- Unknown/unsupported usage semantics.
- Permission compatibility.
- Provider unavailability.

Contract tests are essential to preserving the vendor-agnostic architecture.

---

# Integration Tests

Integration tests validate collaboration between multiple real local components.

Typical examples include:

- SQLite repositories.
- Migration behavior.
- Durable workflow recovery.
- Git operations.
- Filesystem artifact persistence.
- Worktree management.
- `CommandRunner`.
- ConfigurationResolver + filesystem configuration.
- Project Discovery.
- LocalRuntime + fake executor.
- WorkflowEngine + SQLite.
- Event persistence.
- Checkpoint capture/restore.
- Artifact hashing/versioning.
- Evidence persistence.

Integration tests should avoid mocking the infrastructure being validated.

External boundaries unrelated to the behavior under test may still be replaced with fakes or stubs.

Prefer real local dependencies when they are cheap:

```text

SQLite

Git

Filesystem

Local process execution
```

---

# System / CLI End-to-End Tests

System / CLI E2E tests validate complete orchestration behavior through the actual engine and, where appropriate, through the public `waves` process while remaining deterministic.

Vitest is the runner for these tests. CLI scenarios execute the real process against isolated temporary projects/workspaces.

They should typically use:

```text

Temporary Git repository

Real SQLite database

Real filesystem

Real deterministic commands

FakeAgentExecutor

Fake providers where external systems are involved
```

These tests should prove that the same engine can execute materially different workflow definitions.

Important scenarios include:

- Recommended TDD workflow.
- Non-TDD workflow.
- Branching and converging DAG.
- Human approval and rejection.
- Durable resume after process recreation.
- Test-contract protection.
- ExecutionSupervisor rejection.
- Scope-deviation findings.
- Budget exhaustion.
- Retry accounting.
- Failure classification.
- Partial execution.
- Standalone agent execution.
- Recovery behavior.

Normal CI must be able to execute these workflows without live AI providers.

---

# CLI End-to-End Tests

CLI E2E tests validate Waves from the user's public command surface using Vitest to execute the real CLI process against isolated temporary projects/workspaces.

A representative scenario may look like:

```text

Temporary Git repository

        ↓

waves task ...

        ↓

SQLite durable state

        ↓

FakeAgentExecutor

        ↓

Real project commands

        ↓

waves review

        ↓

waves approve

        ↓

process restart

        ↓

waves resume

        ↓

waves status

        ↓

completed workflow
```

Critical CLI scenarios include:

- Prompt task.
- File task.
- Workflow selection.
- `--from <node>` partial execution.
- Supplied prerequisite artifacts.
- Standalone Reviewer.
- Standalone Developer.
- Budget rejection before executor invocation.
- Human review and approval.
- Rejection with feedback.
- Resume after process restart.
- Cancel.
- Doctor/config validation.
- Scriptable output.

The CLI must be tested as an interface to durable engine operations, not as a second orchestration implementation.

---

# Real Provider Smoke Tests

Real AI/provider tests exist to validate adapters, not the core architecture.

They should be:

- Opt-in.
- Disabled in normal CI.
- Small.
- Explicitly configured.
- Safe to run manually.
- Isolated from production environments.
- Cost-aware.

Examples:

```bash

bun run test:executor:claude

bun run test:executor:codex
```

These tests may verify:

- CLI installation/version detection.
- Basic structured-output compatibility.
- Session continuity when supported.
- Usage metadata.
- Workspace editing.
- Adapter error normalization.

Normal CI must never depend on live Claude, Codex, Orca, external memory providers, external issue trackers, or other SaaS systems.

---

# Regression Testing

Regression tests preserve knowledge gained from real failures.

A meaningful bug fix should add a deterministic regression test whenever the failure can be reproduced practically.

Examples:

```text

stale approval was accepted

→ add regression test

retry reset the run budget

→ add regression test

provider-session loss broke workflow resume

→ add regression test

completed node was executed again after recovery

→ add regression test

externally satisfied prerequisite was reported as executed

→ add regression test

developer modified an approved test contract without conflict

→ add regression test
```

Regression tests are **not a separate architectural layer**.

They belong at the layer that owns the behavior:

```text

Unit regression

Integration regression

Workflow E2E regression

CLI E2E regression
```

Avoid creating a large generic `tests/regression/` directory that separates the test from the behavior it protects.

When useful, link the test to the originating issue or bug in a comment.

Example:

```ts
test("does not execute a completed node after recovery", () => {
  // Regression: WV-123
});
```

A bug should not be considered fully fixed until the test protects against recurrence when practical.

---

# Mutation Testing

Mutation testing measures whether the test suite actually protects important rules rather than merely executing lines of code.

Coverage asks:

> Was this code executed?

Mutation testing asks:

> If this rule were subtly broken, would the tests detect it?

Example:

```ts
if (attempt >= specificationFailureThreshold) {
  return "SPECIFICATION_REVIEW";
}
```

A mutation tool may change it to:

```ts
if (attempt > specificationFailureThreshold) {
  return "SPECIFICATION_REVIEW";
}
```

If all tests still pass, the current suite does not sufficiently protect the threshold behavior.

---

## Mutation Testing Scope

Mutation testing should be targeted rather than applied blindly across the entire monorepo.

### Tier 1 — High value / strongly recommended

Use mutation testing for deterministic core logic such as:

- Workflow state machines.
- Node state machines.
- DAG scheduler.
- Cycle detection.
- Configuration precedence.
- Policy resolution.
- BudgetEvaluator.
- Permission rules.
- Context-budget enforcement.
- ExecutionSupervisor.
- Evidence-policy evaluation.
- Approval version validation.
- Test-contract protection.
- FailurePolicy.
- RecoveryPolicy.
- Change-risk deterministic rules.
- Security-sensitive deterministic logic.

### Tier 2 — Optional / selective

Useful when behavior is non-trivial:

- Mappers.
- Context ranking heuristics.
- General application services.
- Relationship/indexing logic.
- Integration orchestration.

### Tier 3 — Usually excluded

Normally exclude:

- CLI formatting.
- Markdown rendering.
- Logging adapters.
- Telemetry exporters.
- Simple provider wrappers.
- Generated code.
- Type-only files.
- Re-exports.
- Trivial getters/setters.
- Configuration files without logic.

---

## Mutation Testing in CI

A complete mutation run can be expensive.

Recommended strategy:

```text

Pull Request CI

├── lint

├── typecheck

├── unit

├── integration

├── workflow E2E

└── targeted mutation for changed critical modules when practical
```

And:

```text

Scheduled / main branch

└── broader mutation suite for critical deterministic packages
```

The project should not optimize for a perfect mutation score.

The goal is to identify tests that fail to protect important invariants.

Mutation score is a diagnostic signal, not a product objective.

---

# Architecture Tests

Architecture boundaries should be executable whenever practical.

Waves relies on strict package separation, so tests should protect these rules.

Examples:

```text

@waves/core

must not import:

- bun:sqlite

- Claude implementation

- Codex implementation

- GitHub SDK

- Orca implementation
```

```text

workflow package

must not depend on concrete executor implementations
```

```text

core/context/workflow

must not import provider-specific configuration types
```

Architecture tests may be implemented using:

- A lightweight custom import scanner.
- Dependency analysis tools.
- Package dependency tests.
- Static graph validation.

The specific tool is less important than making important boundaries verifiable.

---

# TDD Guidelines

## Waves Development TDD

When implementing Waves itself, contributors should prefer:

```text

Behavior / contract

        ↓

Failing test

        ↓

Implementation

        ↓

Refactor
```

TDD is particularly valuable for:

- State machines.
- Scheduler.
- ConfigurationResolver.
- Policy resolution.
- ContextResolver.
- BudgetEvaluator.
- ExecutionSupervisor.
- WorkflowEngine.
- FailurePolicy.
- RecoveryPolicy.
- Approval semantics.
- Protected contracts.

Not every trivial file needs a test-first ceremony, but behavior that defines architecture or correctness should usually be protected before implementation is considered complete.

---

## Waves Runtime TDD

Waves also supports TDD as a **workflow feature**.

For example:

```text

Task

 ↓

Test Architect

 ↓

Human Test Approval

 ↓

Developer

 ↓

Protected Test Contract

 ↓

Deterministic Test Gate
```

This is separate from how Waves itself is developed.

```text

Waves development methodology

≠

Waves runtime TDD workflow
```

The runtime TDD workflow is configurable and policy-driven, not hard-coded into `WorkflowEngine`.

---

# Test Doubles Policy

Test doubles should be chosen deliberately.

## Fake

A functional simplified implementation of a contract.

Preferred for workflow and integration tests.

Examples:

```text

FakeAgentExecutor

FakeProjectMemoryProvider

FakeContextSourceProvider

FakeEvidenceProvider

FakeDeploymentProvider
```

Fakes may keep in-memory state and emulate meaningful behavior.

---

## Stub

Returns predefined data for a narrow scenario.

Useful when a dependency only needs to provide one deterministic response.

---

## Spy

Records interactions when verifying an external boundary interaction is part of the behavior.

Use only when interaction itself matters.

---

## Mock

Use sparingly.

Avoid writing tests dominated by assertions such as:

```ts

expect(service.method).toHaveBeenCalledWith(...)
```

when observable behavior can be tested instead.

Mocks are most appropriate at true external boundaries where reproducing the dependency is impractical.

---

# FakeAgentExecutor

`FakeAgentExecutor` is a core testing primitive.

The orchestration architecture must be fully testable without paid LLM calls.

The fake executor should support deterministic configuration for:

- Structured outputs.
- Workflow Memory writes.
- Artifact candidates.
- HumanReviewModel.
- Usage/token metadata.
- Session metadata.
- Executor failures.
- Missing required outputs.
- Claims of success without actual side effects.
- Multiple attempts.

It should make it possible to test the complete engine before real Claude/Codex adapters exist.

The fake must not silently bypass:

- BudgetPolicy.
- Permissions.
- Output validation.
- ExecutionSupervisor.
- Evidence.
- Failure/recovery policy.
- Durable persistence.

---

# Testing Failure and Recovery

Failure behavior must be tested as intentionally as successful behavior.

Scenarios should include:

- Operational failure.
- Engineering failure.
- Contract failure.
- Specification failure.
- Security failure.
- Policy failure.
- Retry exhaustion.
- Failed retry.
- Repeated engineering failure.
- Rollback success.
- Rollback failure.
- Unsupported compensation.
- Failed compensation.
- Graceful degradation.
- Human escalation.
- Process crash/restart.

Failure category and recovery action are distinct and tests should preserve that separation.

Example:

```text

OPERATIONAL failure

→ retry permitted

CONTRACT failure

→ retry not automatically permitted

optional telemetry failure

→ workflow continues with visible degradation

failed isolated implementation

→ rollback before retry when policy requires
```

---

# Testing Budget and Token Behavior

Budget logic is part of execution safety and must receive dedicated coverage.

Tests should validate:

- Token-only budgets.
- Monetary budgets.
- Unknown provider pricing.
- Unknown provider usage.
- Cached token accounting.
- Multiple attempts.
- Retry cost accumulation.
- Node limits.
- Run limits.
- Project ceilings.
- Context reduction.
- Authorized lower-cost model fallback.
- Forbidden fallback.
- Optional-stage skip.
- Budget pause.
- Hard exhaustion.
- Resume preserving previous spend.

Important invariant:

```text

new attempt != new budget
```

Retries must never reset run-level accounting.

Where usage cannot be known exactly, tests should preserve explicit `unknown` or estimated states rather than expecting fabricated precision.

---

# Testing Context Projection

Context tests should validate:

- Required / relevant / optional ordering.
- Deterministic filtering.
- Deduplication.
- Role-specific projections.
- Token/size budgets.
- Required-context overflow.
- Bounded Project Memory recall.
- Bounded external context.
- Secret filtering.
- Provenance.
- Stable ordering.
- Truncation decisions.
- Optional model-assisted compression fallback behavior.

The tests should prove that Waves does not simply dump all known project information into every agent execution.

---

# Testing Partial Workflow Execution

Partial workflows require dedicated coverage because they introduce truthful externally satisfied prerequisites.

Tests should validate:

- Starting from a valid node.
- Supplied plan.
- Supplied test contract.
- Supplied artifact hashes.
- Provenance.
- Missing prerequisites.
- Stale prerequisites.
- Invalid start node.
- Mandatory upstream policy.
- Downstream approvals.
- Downstream budgets.
- Externally satisfied vs actually executed state.
- Resume after restart.
- History/read-model correctness.

Waves must never mark an upstream agent as completed if it did not execute.

---

# Testing Standalone Agent Execution

Standalone agent execution must be tested as a normal minimal workflow.

Scenarios include:

- Standalone Developer.
- Standalone Reviewer.
- Read-only profile.
- Custom profile.
- Missing required skill.
- Missing executor capability.
- Budget rejection.
- Supervision failure.
- Evidence failure.
- Durable history.

Tests should prove standalone execution does not bypass normal engine guarantees.

---

# Testing Approvals

Approval tests should validate:

- Pending approval.
- Approval success.
- Rejection with feedback.
- Snapshot hash binding.
- Artifact-version binding.
- Stale approval rejection.
- Changed content requiring new approval.
- Resume after process restart.
- Invalid approval after terminal workflow state.
- Automatic approval where autonomy policy explicitly allows it.

Approval must never be treated as a generic mutable boolean.

---

# Testing Permissions

Permission tests should validate:

- Read-only planner.
- Write-enabled developer.
- Denied paths.
- Allowed paths.
- Restricted shell commands.
- Network restrictions.
- Git restrictions.
- Tool/integration restrictions.
- Lower-authority permission escalation attempts.
- Provider capability greater than allowed permission.
- Policy violations before executor invocation.

The selected executor's capabilities must never automatically become effective permissions.

---

# Testing Evidence and Supervision

ExecutionSupervisor tests should validate:

- Executor reports success but required Git diff is empty.
- Required test contract is missing.
- Reviewer returns invalid decision.
- Required memory write is absent.
- Expected file was not created.
- Scope deviation is detected.
- Optional expectation is absent.
- Valid deliverables are accepted.

Evidence tests should separately validate:

- Passing command result.
- Failing command result.
- Git diff.
- Empty diff.
- Test output.
- Build output.
- Lint/typecheck output.
- HTTP response.
- TUI output/state where applicable.
- Security findings.

A failed test is still valid evidence of what happened.

Supervision verifies that the execution produced what it promised.

Evidence verifies broader engineering outcomes.

---

# Testing Providers

Provider tests should validate the provider contract rather than provider internals.

Common concerns include:

- Registration.
- Capability reporting.
- Option validation.
- Health/availability.
- Unsupported version.
- Unsupported capability.
- Required vs optional provider behavior.
- Failure normalization.
- Secret-safe behavior.
- Deterministic fake adapter behavior.

Real provider tests remain opt-in.

---

# Testing Architecture

## Co-Located Tests

Tests should live close to the behavior they validate.

Example:

```text

packages/

└── workflow/

    └── src/

        ├── scheduler/

        │   ├── scheduler.ts

        │   └── scheduler.test.ts

        └── state-machine/

            ├── workflow-run.ts

            └── workflow-run.test.ts
```

Co-location improves discoverability and reduces the likelihood of tests becoming outdated.

Small wrappers, type-only modules, configuration files, or trivial re-exports generally do not require dedicated tests.

---

## Shared Testing Infrastructure

Only reusable test infrastructure should be centralized.

A possible structure:

```text

tests/

├── fixtures/

│   ├── workflows/

│   ├── projects/

│   └── providers/

├── factories/

├── git/

├── sqlite/

├── executors/

├── providers/

├── helpers/

└── e2e/
```

Shared infrastructure may include:

- Temporary repository helpers.
- SQLite test database helpers.
- Fake providers.
- Workflow factories.
- Task factories.
- Run factories.
- Clock helpers.
- ID generators.
- Command fixtures.

Feature/domain tests themselves should remain co-located where practical.

---

# Test Fixtures

Prefer reusable factories over large opaque fixtures.

Examples:

```ts
createTestRepository();

createTestDatabase();

createWorkflowFixture();

createTaskFixture();

createRunFixture();

createAgentProfileFixture();

createProjectContextFixture();
```

Fixtures should:

- Be explicit.
- Be small.
- Avoid unnecessary defaults.
- Avoid shared mutable state.
- Make the behavior under test obvious.

Avoid one giant "everything configured" fixture used by unrelated tests.

---

# Git and Filesystem Fixtures

Tests involving repository state must use isolated temporary directories.

Each test should receive its own repository or workspace unless the test explicitly validates shared behavior.

Example:

```text

temp/

└── test-<unique-id>/

    ├── .git/

    ├── package.json

    └── src/
```

Tests should never depend on:

- The developer's active Waves checkout.
- Global Git state beyond explicitly controlled configuration.
- Files created by previous tests.
- Execution order.

Cleanup should be deterministic and safe.

---

# SQLite Test Infrastructure

SQLite integration tests should use isolated temporary databases.

Tests should validate:

- Migration ordering.
- Idempotent startup.
- Transactions.
- Repository behavior.
- Multiple attempts.
- Event history.
- Workflow recovery.
- Snapshot immutability.
- Artifact/evidence persistence.

A test should never rely on another test's persisted data.

---

# Determinism and Time

Waves includes time-sensitive behavior such as:

- Timestamps.
- Timeouts.
- Retry backoff.
- Budget windows.
- Rollout observation.
- Event ordering.

Tests should avoid sleeping or relying on wall-clock time whenever possible.

Where necessary, use explicit abstractions such as:

```text

Clock

Sleeper / Timer

ID Generator
```

Do not write tests that depend on:

```ts
await Bun.sleep(5000);
```

unless the timing behavior itself is the real integration under test and no deterministic alternative exists.

---

# Test Naming

Describe behavior rather than implementation.

Prefer:

```text

marks a node as ready when all dependencies are completed
```

instead of:

```text

calls getCompletedDependencies()
```

Prefer:

```text

rejects a developer result when no required code change exists
```

instead of:

```text

calls gitDiff()
```

Prefer:

```text

requires a new approval when the reviewed snapshot changes
```

instead of:

```text

sets approval stale to true
```

Good test names describe what the consumer, workflow, or system observes.

---

# Arrange, Act, Assert

Whenever practical, structure tests using Arrange–Act–Assert.

```text

Arrange

Act

Assert
```

Example:

```ts

test("does not execute a node before its dependencies complete", () => {

  // Arrange
  const workflow = createWorkflowFixture(...);

  // Act
  const ready = scheduler.getReadyNodes(...);

  // Assert
  expect(ready).not.toContain("implementation");
});
```

Consistent structure improves readability and maintainability.

For larger workflow scenarios, a Given / When / Then mental model is also acceptable without requiring a BDD framework.

---

# Test Isolation

Each test must be independent.

Avoid relying on:

- Shared mutable state.
- Previous tests.
- Test execution order.
- Shared repositories.
- Shared SQLite files.
- Global environment mutations without cleanup.
- Live provider sessions.
- External network availability.

A test should pass regardless of the order in which the suite executes.

---

# Mocking Guidelines

Prefer mocking only true external boundaries.

Good candidates include:

- AI providers.
- External HTTP APIs.
- Issue trackers.
- External memory systems.
- Observability backends.
- Cloud/deployment providers.
- Third-party review tools.

Avoid mocking:

- Domain rules.
- Scheduler logic.
- Policy logic.
- State transitions.
- Internal services when real collaboration is inexpensive.
- SQLite when testing persistence.
- Git when testing Git behavior.
- Filesystem when testing artifact/workspace behavior.

Mocking internal implementation often reduces confidence.

---

# What Should Be Tested

The project does not require every file to have a corresponding test.

Tests should exist where they provide meaningful confidence.

Prioritize:

- Domain rules.
- State transitions.
- Validation logic.
- DAG behavior.
- Error handling.
- Retry behavior.
- Approval behavior.
- Permissions.
- Budgets.
- Recovery.
- Persistence.
- Provider contracts.
- Critical CLI workflows.
- Architectural boundaries.

Small wrappers, pure type declarations, configuration files, and trivial re-exports usually do not require dedicated tests.

---

# Test Execution

The exact scripts may evolve during implementation, but the intended command surface should remain simple and layered. Bun is the runtime/package manager; Vitest is the canonical test runner.

Example:

```bash

bun test
```

Runs the fast default test suite.

```bash

bun run test:unit
```

Runs unit/domain/property tests when separated.

```bash

bun run test:integration
```

Runs local integration tests using temporary Git/SQLite/filesystem resources.

```bash

bun run test:e2e
```

Runs deterministic workflow/CLI end-to-end scenarios.

```bash

bun run test:mutation
```

Runs mutation tests for selected critical packages.

```bash

bun run test:provider:claude

bun run test:provider:codex
```

Runs opt-in real-provider smoke tests.

The exact naming should be finalized with the implementation, but normal CI must remain provider-independent.

---

# Testing Technology Stack

The canonical testing technology stack is intentionally small:

| Concern                | Technology                                             |
| ---------------------- | ------------------------------------------------------ |
| Unit tests             | Vitest                                                 |
| Integration tests      | Vitest + real local infrastructure where practical     |
| Contract tests         | Vitest reusable contract suites                        |
| Regression tests       | Vitest or the lowest reliable test layer               |
| System / CLI E2E       | Vitest + real process execution                        |
| Property-based testing | fast-check + Vitest                                    |
| Mutation testing       | Stryker Mutator + Vitest                               |
| Type tests             | Vitest type assertions/typecheck + TypeScript compiler |
| TUI testing            | OpenTUI + Vitest                                       |
| Static analysis        | Oxlint                                                 |
| Formatting             | Oxfmt                                                  |
| Coverage               | Vitest coverage as a diagnostic signal                 |

Not part of the current foundation:

- Playwright — no browser application is planned.
- SuperTest — Waves has no primary HTTP application surface.
- Bun Test — Vitest is the canonical test runner.

If a browser or primary HTTP application surface is introduced later, its testing technology should be evaluated at that time rather than included speculatively in the foundation.

---

# TUI Testing

OpenTUI is the selected technology for Waves' interactive terminal UI. TUI tests are presentation-focused and remain separate from workflow/system E2E tests.

TUI testing should use Vitest-based tests and deterministic input/state fixtures wherever OpenTUI supports the required test surface.

TUI tests should validate:

- Rendering of important workflow and node states.
- Approval and waiting-state presentation.
- Failure, retry, blocked, and invalidated states.
- Navigation and selection behavior.
- Stable output for scriptable/non-interactive paths where applicable.
- Correct mapping from durable engine state to presentation state.

The TUI must not contain orchestration logic that requires a separate end-to-end testing architecture.

---

# Test Execution Tiers

Waves separates fast deterministic feedback from deeper validation.

```text
Fast local / PR validation
├── Oxfmt check
├── Oxlint
├── TypeScript typecheck
├── Vitest unit tests
├── Vitest integration tests
├── Fast property-based tests
├── Selected system / CLI E2E
└── Architecture boundary tests

Deep / scheduled / release validation
├── Full system / CLI E2E
├── Extended property-based tests
├── Broader Stryker mutation testing
├── TUI validation
└── Opt-in provider/integration smoke tests where explicitly configured
```

The fast tier must remain deterministic and provider-independent. Deeper tiers may be more expensive, but live AI/provider calls remain isolated to explicitly classified provider/integration smoke tests.

---

# Continuous Integration

The default CI pipeline should run on pull requests and pushes to the main development branch.

It should validate:

```text

format/lint

typecheck

unit tests

property-based tests where fast enough

integration tests

workflow E2E tests

CLI E2E tests

architecture boundary tests

build/package checks
```

Real provider smoke tests should not run by default.

Mutation testing strategy:

```text

Pull requests

→ targeted mutation for changed critical modules when practical

Main / scheduled

→ broader mutation suite for critical deterministic packages
```

CI must remain:

- Deterministic.
- Offline-capable where practical.
- Secret-safe.
- Independent from paid providers.
- Reproducible locally.

Merging code should never require bypassing failing deterministic quality gates.

---

# Critical Golden Scenarios

Waves should maintain a small set of high-value golden system/CLI E2E scenarios implemented with Vitest and deterministic local infrastructure.

These should protect architecture-level guarantees such as:

## Successful TDD workflow

```text

Task

→ Plan

→ Approval

→ Test Contract

→ Approval

→ Implementation

→ Supervision

→ Test Gate

→ Evidence

→ Review

→ Complete
```

## Rejected plan

```text

Planner attempt 1

→ Human rejection

→ feedback persisted

→ Planner attempt 2

→ approval

```

## Durable restart

```text

RUNNING / WAITING_APPROVAL

→ process destroyed

→ fresh process

→ same persisted run restored

```

## Stale approval

```text

snapshot v1 approved

→ underlying content changes

→ approval no longer valid

```

## Protected test contract

```text

approved test hash

→ Developer modifies test

→ CONTRACT failure

→ TEST_CONTRACT_CONFLICT

```

## Supervision rejection

```text

Developer claims success

→ Git diff empty

→ execution rejected

```

## Budget exhaustion

```text

remaining budget insufficient

→ executor is not invoked

→ durable budget decision recorded

```

## Partial workflow

```text

supplied plan

→ start from Developer

→ Planner not reported as executed

→ provenance preserved

```

## Standalone review

```text

waves agent run reviewer

→ minimal ad-hoc workflow

→ read-only permissions

→ normal supervision/history

```

## Recovery

```text

attempt 1 fails

→ rollback/checkpoint restoration

→ attempt 2 starts from clean state

```

These scenarios should remain deterministic and provider-independent.

---

# Mutation Testing and Regression Policy Summary

The project follows these two policies:

> **A bug is not considered fully fixed until the failure is protected by a deterministic regression test whenever practical.**

> **Mutation testing is used selectively to verify that tests actually protect critical invariants; Waves does not optimize for a perfect repository-wide mutation score.**

---

# Summary

The Waves testing strategy aims to maximize engineering confidence while minimizing maintenance cost, flakiness, external dependencies, and paid model usage.

In summary:

- Test behavior over implementation.
- Keep tests close to the behavior they validate.
- Prefer deterministic local infrastructure.
- Use FakeAgentExecutor as a first-class testing primitive.
- Keep normal CI independent from live AI providers.
- Test state machines and DAG invariants explicitly.
- Use property-based tests for broad invariant spaces.
- Use shared contract suites for provider implementations.
- Use integration tests with real Git, SQLite, filesystem, and commands.
- Use workflow and CLI E2E tests for critical orchestration behavior.
- Turn meaningful bugs into regression tests.
- Apply mutation testing selectively to critical deterministic logic.
- Enforce architecture boundaries with executable tests where practical.
- Test failure and recovery paths as seriously as success paths.
- Keep budget, permission, approval, and provenance semantics under test.
- Prefer readability over cleverness.
- Confidence is more valuable than coverage.
- Write tests that make future refactoring safer.
