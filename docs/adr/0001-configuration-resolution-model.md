# ADR 0001 — Configuration Resolution Model

## Context

Introduced `@waves/config`, the first implementation of the versioned, layered, Zod-validated configuration system specified conceptually in `docs/contracts/core-contracts-v0.1.md` §4-10 and `docs/architecture/architecture-v0.1.md` §5. This is the first ADR in the repository; it records the resolution-model decisions made while implementing that contract, so future config work doesn't re-litigate them.

## Decisions

### 1. Mandatory policy is a constraint boundary, not a precedence layer

Normal configuration layers (`builtin → user → project → profile → workflow → node → cli`) merge with override-wins semantics: whichever layer is highest wins outright. If `policies` participated in that same walk, any higher-authority layer — including a CLI flag — could silently weaken a mandatory project policy, which architecture-v0.1.md §5.2 explicitly forbids.

Instead, `policies` is excluded from the normal merge (`mergeWavesConfig`) entirely and merged by a separate function (`mergePolicyConfig`) with:

- a stricter-wins rule (numeric limits take the minimum, boolean must-approve flags OR together, evidence-gate lists union) — lower layers can only tighten, never loosen;
- a hard-rejection rule: only `builtin` and `project` sources may contribute `policies` fields at all; any other source attempting to do so is a `ConfigError POLICY_VIOLATION`, not a silently dropped value.

`ResolvedConfig.policySnapshot` is populated from this separate path and is the one future enforcement code must consult, distinct from the display copy under `values.policies`.

### 2. Migrations are pure functions keyed by version, applied sequentially

Each `ConfigMigration` is `{ fromVersion, toVersion, migrate: (old) => new }` with no side effects. `migrateConfig` walks `fromVersion → fromVersion+1 → … → CURRENT_WAVES_CONFIG_VERSION`, applying each link found in the registry. If no migration exists for the current hop, resolution fails with `ConfigError UNSUPPORTED_CONFIG_VERSION` rather than guessing or silently accepting a stale schema. This keeps migrations independently testable and composable, and gives both user and project config files their own migration pass before merging — a user on an older schema version and a project on a newer one can still merge correctly.

### 3. Secrets have no literal-value schema variant

`SecretReference` is `{ source: "env", name } | { source: "secretRef", ref }` — a discriminated union with no plain-string branch. Anywhere a credential-shaped field exists in a domain schema, its type is `SecretReference`, never `z.string()`. This means a literal secret is a Zod validation failure, not something a heuristic scanner has to catch after the fact — "never serialized into committed config by default" is enforced structurally.

### 4. Provider validation seam without a registry

WV-24 defines `ProviderReference<TOptions> = { provider, required?, options? }` and a `ProviderOptionsValidator` interface the still-unimplemented provider registry (WV-17) will satisfy. `ConfigurationResolver` accepts an optional validator (default: permissive, accepts anything) and is expected to call it lazily at actual provider-reference read sites, never eagerly during `resolve()`. This lets config and the future registry ship independently without either faking the other's behavior.

### 5. Layer order

`builtin → user → project → profile → workflow → node → cli`, lowest to highest authority. `environment` and `discovered` are provenance _kinds_ used to tag values folded into one of the above layers (e.g. an env-sourced secret inside `project`), not separate ordered layers of their own.
