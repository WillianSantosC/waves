import type { ConfigurationExplanation } from "./configuration-explanation.ts";
import type { ConfigurationResolutionRequest } from "./configuration-resolution-request.ts";
import type { ConfigurationValidationResult } from "./configuration-validation-result.ts";
import type { ResolvedConfig } from "../resolved-config/resolved-config.ts";

/**
 * No subsystem should parse project YAML, user config, or provider
 * options independently — everything consumes a validated
 * `ResolvedConfig` produced through here.
 */
export interface ConfigurationResolver {
  resolve(request: ConfigurationResolutionRequest): Promise<ResolvedConfig>;
  validate(input: unknown): Promise<ConfigurationValidationResult>;
  explain(resolved: ResolvedConfig, path?: string): Promise<ConfigurationExplanation>;
}
