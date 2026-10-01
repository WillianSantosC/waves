import { ConfigError } from "../configuration-resolver/config-error.ts";
import type { ConfigSource } from "../provenance/config-source.ts";
import type { PolicyConfig } from "./policy-config.ts";

const ALLOWED_POLICY_SOURCE_KINDS: ReadonlySet<ConfigSource["kind"]> = new Set([
  "builtin",
  "project",
]);

export interface PolicyConfigLayer {
  source: ConfigSource;
  policies: PolicyConfig | undefined;
}

/**
 * Merges the mandatory-policy layer with stricter-wins semantics: lower
 * layers can only tighten, never loosen, a higher-authority layer's
 * constraint. This is deliberately a different function from
 * `mergeWavesConfig`'s override-wins walk, so the constraint-boundary
 * nature of policy is visible in code, not just documentation.
 *
 * Only `builtin` and `project` sources may contribute `policies` fields;
 * any other source attempting to set `policies` is a hard
 * `ConfigError POLICY_VIOLATION`, never a silent drop.
 */
export function mergePolicyConfig(layers: PolicyConfigLayer[]): PolicyConfig {
  let merged: PolicyConfig = {};

  for (const layer of layers) {
    if (layer.policies === undefined) {
      continue;
    }
    assertAllowedPolicySource(layer.source);
    merged = mergeOnePolicyLayer(merged, layer.policies);
  }

  return merged;
}

function assertAllowedPolicySource(source: ConfigSource): void {
  if (ALLOWED_POLICY_SOURCE_KINDS.has(source.kind)) {
    return;
  }
  throw new ConfigError({
    code: "POLICY_VIOLATION",
    message: `"policies" cannot be set from a "${source.kind}" source; only "builtin" and "project" sources may set mandatory policy.`,
    details: { source },
  });
}

function mergeOnePolicyLayer(merged: PolicyConfig, incoming: PolicyConfig): PolicyConfig {
  return {
    ...withDefined(
      "requireApprovalForIrreversible",
      orBoolean(merged.requireApprovalForIrreversible, incoming.requireApprovalForIrreversible),
    ),
    ...withDefined("maxRunCostUsd", stricterOf(merged.maxRunCostUsd, incoming.maxRunCostUsd)),
    ...withDefined(
      "maxNodeTimeoutMs",
      stricterOf(merged.maxNodeTimeoutMs, incoming.maxNodeTimeoutMs),
    ),
    ...withDefined(
      "mandatoryEvidenceGates",
      unionOf(merged.mandatoryEvidenceGates, incoming.mandatoryEvidenceGates),
    ),
  };
}

function withDefined<K extends string, V>(key: K, value: V | undefined): Record<K, V> | object {
  return value !== undefined ? { [key]: value } : {};
}

function orBoolean(a: boolean | undefined, b: boolean | undefined): boolean | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  return a || b;
}

function stricterOf(a: number | undefined, b: number | undefined): number | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  return Math.min(a, b);
}

function unionOf(a: string[] | undefined, b: string[] | undefined): string[] | undefined {
  if (a === undefined && b === undefined) return undefined;
  return Array.from(new Set([...(a ?? []), ...(b ?? [])]));
}
