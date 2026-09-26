# Waves

> A configurable, cost-aware software delivery orchestrator for AI coding agents, built around DAG workflows, quality gates, human oversight, and evidence-driven execution.

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=WillianSantosC_waves&metric=coverage)](https://sonarcloud.io/summary/new_code?id=WillianSantosC_waves)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=WillianSantosC_waves&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=WillianSantosC_waves)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=WillianSantosC_waves&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=WillianSantosC_waves)
[![CI](https://github.com/WillianSantosC/waves/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/WillianSantosC/waves/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.md)

## Overview

Waves is an open-source software delivery orchestration engine designed to coordinate AI coding agents across the engineering lifecycle.

Instead of treating an AI agent as the owner of the development process, Waves treats agents as specialized workers inside a structured, durable, and verifiable workflow.

Agents reason and execute work. **Waves owns, coordinates, and verifies the engineering process.**

> [!NOTE]
> Waves is currently under active development. The architecture and APIs may evolve while the initial milestones are implemented.

---

## Why Waves?

AI coding agents are becoming increasingly capable at planning, implementing, testing, and reviewing software.

However, running a capable coding agent is not the same as having a reliable software delivery process.

Real-world engineering requires more than generating code:

- understanding the project and its conventions;
- planning changes;
- validating assumptions;
- running tests, builds, and static analysis;
- coordinating specialized reviews;
- enforcing engineering and security policies;
- collecting evidence that a change actually works;
- controlling permissions and side effects;
- involving humans when judgment is required;
- recovering safely from failures;
- keeping execution costs under control.

Waves provides the orchestration layer around those agents.

```text
Task
  ↓
Workflow
  ↓
┌──────────────────────────────────────┐
│ Discovery                            │
│ Planning                             │
│ Human Approval                       │
│ Test Architecture                    │
│ Implementation                       │
│ Validation                           │
│ Security / Code Review               │
│ Evidence                             │
└──────────────────────────────────────┘
  ↓
Verified Result
```

The workflow itself is configurable. The example above is a recommended engineering workflow, not a hardcoded execution model.

---

## Core Philosophy

### Agents execute work. Waves owns the process.

An agent reporting that a task is complete does not make the workflow complete.

```text
Agent output ≠ Workflow truth
```

Waves independently manages workflow state, validates structured outputs, supervises expected side effects, runs deterministic quality gates, collects evidence, and records human decisions.

### Deterministic software first

Waves should not spend model tokens on work that regular software can perform reliably.

Operations such as these should normally require zero LLM tokens:

- repository discovery;
- DAG scheduling;
- configuration resolution;
- Git inspection;
- test execution;
- linting and type checking;
- build execution;
- output schema validation;
- evidence collection;
- budget enforcement;
- checkpoint and rollback operations;
- state persistence.

LLMs are reserved for tasks where reasoning provides meaningful value.

> **Waves spends model tokens only when reasoning is required.**

### Quality should scale with budget, correctness should not

Waves is designed to remain useful without requiring expensive models or large token budgets.

A cost-conscious workflow may use only a developer agent plus deterministic validation, while a quality-focused workflow may add dedicated planning, testing, security, and review agents.

Both still benefit from the same deterministic correctness mechanisms.

```text
Cost-conscious

Developer
   ↓
Tests / Build / Lint
   ↓
Supervision
   ↓
Evidence
```

```text
Quality-focused

Planner
   ↓
Test Architect
   ↓
Developer
   ↓
Tests / Build / Lint
   ↓
Security Review ─┐
Code Review ─────┤
Architecture ────┘
   ↓
Evidence
```

---

## Configurable DAG Workflows

Waves models software delivery as a Directed Acyclic Graph.

A workflow may contain heterogeneous node types:

```text
AgentNode
GateNode
CommandNode
HumanNode
WorkflowReferenceNode
```

A simple workflow could be:

```text
Planner → Developer → Tests → Review
```

A more complex workflow can branch and execute independent work concurrently:

```text
                Planning
               /        \
        Backend          Frontend
               \        /
              Integration
                   ↓
                 Review
```

Workflows describe **what process should happen**.

Agents, runtimes, executors, models, permissions, context, and policies remain independently configurable.

---

## Run Only What You Need

Waves is not limited to executing complete workflows.

### Run a standalone agent

A developer or reviewer can be executed independently while retaining the same configuration, permissions, budgets, supervision, and evidence infrastructure.

Conceptually:

```bash
waves agent run developer \
  --instructions "Implement the caching strategy described in docs/cache-plan.md"
```

or:

```bash
waves agent run reviewer \
  --instructions "Review the current working tree changes"
```

Internally, standalone execution is still represented as a minimal workflow rather than bypassing the orchestration engine.

### Start from a specific workflow node

If planning or another upstream activity has already happened outside Waves, execution can begin from a later stage.

Conceptually:

```bash
waves task ./task.md \
  --workflow builtin:tdd-feature \
  --from developer \
  --input plan=./plan.md
```

External prerequisites retain provenance and must satisfy applicable workflow policies.

Waves does not pretend skipped agents executed successfully.

---

## Architecture

Waves separates four fundamental concerns:

```text
WHAT  = Workflow / Task / Node
WHO   = Agent Profile + Skills
WHERE = Workspace + Runtime
HOW   = Executor
```

For example:

```text
WHAT
Implement authentication caching

WHO
Developer
+ TypeScript Skill
+ Project Auth Skill

WHERE
Git Worktree
+ LocalRuntime

HOW
Codex Executor
```

This separation allows combinations such as:

```text
Worktree + LocalRuntime + Codex
Worktree + LocalRuntime + Claude
Worktree + OrcaRuntime + Claude
```

without coupling workflow definitions to a particular coding agent or isolation mechanism.

---

## Agent Profiles and Skills

Agents are defined through reusable profiles.

Examples include:

- Project Understanding;
- Planner;
- Test Architect;
- Developer;
- Reviewer;
- Security Reviewer.

Profiles may define:

- instructions;
- required and preferred skills;
- permissions;
- context requirements;
- model preferences;
- executor preferences;
- expected outputs;
- evidence expectations.

Skills can come from multiple sources:

```text
~/.waves/skills
.waves/skills
.agents/skills
.claude/skills
.cursor/rules
```

Waves resolves these into an effective agent definition for each execution.

---

## Project Context

Waves distinguishes deterministic repository discovery from AI reasoning.

### Project Discovery

Waves can discover repository information such as:

- Git metadata;
- `AGENTS.md`;
- `CLAUDE.md`;
- project documentation;
- ADRs;
- package manifests;
- test commands;
- build commands;
- CI workflows;
- available skills and rules.

This answers:

> **What exists in this repository?**

### Task Understanding

Agents can then reason over a bounded projection of that context to determine:

- affected modules;
- relevant architecture;
- existing implementation patterns;
- related tests;
- applicable skills;
- task-specific risks.

This answers:

> **What matters for this task?**

Project discovery should be reusable and incrementally refreshed rather than repeated through expensive LLM calls for every task.

---

## Token and Cost Awareness

Token consumption is treated as an execution constraint rather than only an analytics metric.

Waves is designed around:

- run-level budgets;
- node-level budgets;
- bounded context projection;
- bounded memory retrieval;
- provider usage accounting;
- cached-token accounting when available;
- pre-execution budget enforcement;
- cost-conscious workflow presets.

Conceptually:

```yaml
budget:
  maxRunCostUsd: 3.00

context:
  budgets:
    developer: 16000
    reviewer: 8000
```

Before an agent executes:

```text
Resolved Context
      ↓
Token Estimate
      ↓
Budget Policy
      ↓
Allowed?
 ┌────┴────┐
Yes       No
 ↓         ↓
Execute   Reduce / Pause / Stop
```

The goal is not to maximize agent activity.

The goal is to maximize **engineering confidence per token spent**.

---

## Execution Supervision

A successful model response does not automatically mean a successful agent execution.

Waves supervises expected deliverables and side effects.

For example:

```text
Developer says:
"Implementation completed."

Expected:
code-change

Git diff:
empty

→ execution rejected
```

Or:

```text
Reviewer returns:
"Looks good."

Expected:
structured ReviewDecision

→ execution rejected
```

Execution supervision answers:

> **Did the agent actually produce what this execution required?**

Evidence gates answer a different question:

> **Does the resulting system satisfy the required engineering guarantees?**

---

## Evidence-Driven Completion

Waves can require concrete evidence before accepting work.

Evidence may include:

- Git diffs;
- tests;
- lint results;
- type checks;
- builds;
- HTTP responses;
- screenshots;
- security scans;
- custom project-specific checks.

```text
Agent
  ↓
Execution Supervision
  ↓
Tests / Build / Validation
  ↓
Evidence Collection
  ↓
Evidence Gate
  ↓
Completed
```

Failing evidence is still useful evidence. It becomes structured input for failure handling rather than being hidden or interpreted as success.

---

## Human-in-the-Loop

Human decisions are first-class workflow operations.

Waves supports workflows where humans may:

- approve plans;
- approve test contracts;
- review high-risk changes;
- resolve contract conflicts;
- approve irreversible actions;
- reject or redirect execution.

Approvals are bound to versioned state.

If the underlying artifact changes after approval, Waves can invalidate the previous approval instead of silently treating it as valid.

---

## Risk-Aware Execution

Waves distinguishes expected task impact from the risk introduced by the actual implementation.

```text
Task Impact Assessment
"What do we expect this task to affect?"

             ↓

Implementation

             ↓

Change Risk Assessment
"What risk did the actual change introduce?"
```

Risk signals can include:

- changed paths;
- diff size;
- security-sensitive modules;
- authentication or authorization changes;
- infrastructure changes;
- database migrations;
- dependency changes;
- unexpected scope deviations;
- failed or missing evidence.

This allows review depth to scale with actual risk.

```text
Low risk
→ deterministic gates

Medium risk
→ code review

High risk
→ specialist review + human approval
```

---

## Failure and Recovery

Failures are classified instead of blindly retried.

Waves distinguishes categories such as:

```text
OPERATIONAL
ENGINEERING
CONTRACT
SPECIFICATION
SECURITY
POLICY
```

Policies can then decide whether to:

```text
retry
fail fast
pause
request human review
rollback
compensate
degrade safely
```

Repeated engineering failures may indicate that the specification itself is wrong rather than that the coding agent simply needs another attempt.

---

## Rollback and Compensation

Waves distinguishes local rollback from external compensation.

```text
Rollback
→ restore Waves-controlled state

Compensation
→ perform another action that semantically
  reverses an external side effect
```

For example:

```text
Failed code attempt
→ restore workspace checkpoint

Created pull request
→ close PR when supported

Deployment failure
→ rollback deployment when supported
```

External side effects are classified by reversibility and provider capabilities rather than assuming everything can be undone.

---

## Memory

Waves deliberately separates different kinds of memory.

```text
Workflow Memory
→ temporary/run-specific state required for correctness

Project Context
→ facts derived from the current repository

Project Memory
→ reusable knowledge retained across runs

External Memory
→ optional cross-agent/provider-backed memory

Artifacts
→ durable, versioned and auditable contracts or evidence
```

Workflow Memory always remains owned by Waves.

Project Memory uses a provider-neutral interface and may use the native Waves implementation or optional external providers.

This prevents workflow correctness from depending on an external memory system.

---

## Provider-Neutral by Design

Waves is designed around registries and capability contracts rather than hardcoded integrations.

Potential provider categories include:

```text
Executors
Runtimes
Project Memory
Agent Handoff
Evidence
Security
Task Providers
Context Sources
Review Providers
Delivery Providers
Observability
Deployment
Production Signals
```

Concrete integrations register their:

- identity;
- configuration schema;
- capabilities;
- availability;
- health checks;
- compatibility information.

This allows Waves to grow through adapters instead of rewriting its core.

---

## External Context

Repository context is not always enough.

Waves is designed to support bounded context retrieval from external systems such as:

```text
GitHub
Jira
Slack
Notion
Observability platforms
Internal documentation
Custom MCP servers
```

External data still passes through:

```text
Context Source
      ↓
Retrieval
      ↓
Permissions
      ↓
Deduplication
      ↓
Token Budget
      ↓
Context Projection
      ↓
Agent
```

Giving an agent access to an external system does not mean sending everything from that system into the model context.

---

## Durable and Resumable

Waves persists workflow execution state so that long-running workflows do not depend on a single process remaining alive.

Example states include:

```text
PENDING
READY
RUNNING
WAITING_INPUT
WAITING_APPROVAL
COMPLETED
FAILED
BLOCKED
SKIPPED
INVALIDATED
CANCELLED
```

The architecture distinguishes:

```text
Crash Recovery
→ resume execution from durable state

Rollback
→ intentionally undo an execution
```

Relevant workflow transitions are recorded as durable events alongside current-state projections to support recovery, debugging, auditability, and timeline visualization.

---

## Software Delivery Beyond Code Generation

Waves is designed to eventually support the broader software-delivery lifecycle.

```text
Task
 ↓
Engineering Workflow
 ↓
Validation
 ↓
Risk Assessment
 ↓
Review
 ↓
Release
 ↓
Rollout Observation
 ↓
Production Signals
 ↓
Incident / Regression
 ↓
New Remediation Workflow
```

Deployment and production capabilities are optional provider-backed extensions rather than requirements for the core engine.

The same workflow model can therefore power anything from a standalone reviewer to a complete AI-assisted software delivery pipeline.

---

## Configuration

Configuration is layered:

```text
Built-in Defaults
        ↓
User Configuration
        ↓
Project Configuration
        ↓
Workflow Configuration
        ↓
CLI Overrides
```

Security and organizational policies remain authoritative and cannot be weakened by lower-authority configuration.

Waves distinguishes **configuration** from **policy**.

Configuration answers:

> What does the user want?

Policy answers:

> What is the execution allowed to do?

---

## Planned CLI

The CLI is expected to include commands such as:

```bash
waves init
waves setup
waves doctor

waves config show
waves config validate
waves config explain

waves discover
waves context show
waves context refresh

waves task
waves agent run

waves status
waves review
waves approve
waves reject
waves resume
waves cancel
```

The exact CLI surface may evolve while the initial milestones are implemented.

---

## Technology

The initial implementation is intentionally lightweight:

- TypeScript (strict, ESM);
- Bun;
- Bun Workspaces (`apps/*`, `packages/*`);
- Commander.js;
- Zod;
- SQLite through `bun:sqlite`;
- YAML configuration;
- Oxlint + Oxfmt;
- Vitest;
- native Git CLI.

The MVP intentionally avoids unnecessary infrastructure such as Redis, message queues, heavy ORMs, vector databases, or mandatory container orchestration.

### Project development baseline

Every workspace package inherits the same deterministic quality toolchain from the repository root:

- **TypeScript** in strict mode (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, consistent file casing), compiled as ESM.
- **Oxlint** for linting, including complexity guardrails (`complexity <= 15`, `max-depth <= 3`, `max-params <= 4`, cognitive complexity `<= 10`).
- **Oxfmt** for formatting (100-column width, 2-space indentation, semicolons, double quotes, trailing commas, LF line endings).
- **Vitest** as the default test runner across the CLI and core packages.

Run the full local gate with:

```bash
bun run check
```

The detailed testing strategy (test tiers, fast-check, Stryker Mutator, OpenTUI validation) is documented in [TESTING.md](TESTING.md) and is not duplicated here.

---

## Roadmap

Waves is being developed incrementally.

The current architecture is organized around the following phases:

1. **Project Foundation**
2. **Configuration, Workflow & Project Discovery Foundation**
3. **Core Domain & Workflow Graph**
4. **Durable State & Human Control**
5. **Project Context, Memory & Skills**
6. **Engineering Execution & Evidence**
7. **Real Agent Runtime & Executors**
8. **MVP CLI & Developer Experience**
9. **Hardening**
10. **Isolation, Advanced Quality & Workflow Composition**
11. **Parallel Waves & External Integrations**
12. **Knowledge, Optimization & Observability**
13. **Deployment, Rollout & Production Feedback**

The early milestones deliberately focus on contracts and deterministic infrastructure before integrating real coding agents.

---

## What Waves Is Not

Waves is not intended to be:

- another coding model;
- a single autonomous coding agent;
- a prompt wrapper around Claude or Codex;
- an agent swarm where every operation requires an LLM;
- a replacement for Git, CI, testing, or observability;
- tied to one model provider, runtime, issue tracker, or deployment platform.

Waves sits above these systems and coordinates them.

---

## Project Status

Waves is currently in early development.

The initial work focuses on establishing the core contracts, configuration system, workflow model, durable state, and execution boundaries before introducing real agent integrations.

Expect breaking changes while the foundation is being built.

---

## Long-Term Vision

Waves aims to make AI-assisted software delivery behave less like a collection of autonomous chat sessions and more like an engineering system.

```text
Humans define intent and policy.

Agents provide reasoning and implementation.

Deterministic software provides guarantees.

Evidence establishes what actually happened.

Waves coordinates the process.
```

The goal is not fully autonomous software development at any cost.

The goal is a configurable system where teams can deliberately choose their balance between:

```text
autonomy
quality
risk
cost
human oversight
```

while keeping the underlying engineering process observable, durable, and verifiable.

---

## License

This is a open-source software. See [LICENSE.md](LICENSE.md) for details.
