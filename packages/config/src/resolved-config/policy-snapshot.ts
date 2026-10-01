import type { ConfigSource } from "../provenance/config-source.ts";
import type { PolicyConfig } from "../domains/policy-config.ts";

/**
 * The authoritative mandatory-policy result, merged via `mergePolicyConfig`
 * (stricter-wins) rather than the normal override-wins precedence walk.
 * Any future policy-enforcement code must consult this, not
 * `ResolvedConfig.values.policies` (which holds the same data purely for
 * display/`waves config show`).
 */
export interface PolicySnapshot {
  policies: PolicyConfig;
  source: ConfigSource;
}
