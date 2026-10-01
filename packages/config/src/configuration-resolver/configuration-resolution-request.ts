import type { ProviderOptionsValidator } from "../provider-reference/provider-options-validator.ts";
import type { WavesConfig } from "../waves-config/waves-config.ts";
import type { ConfigSourceKind } from "../provenance/config-source.ts";

export interface ConfigurationOverrideLayer {
  kind: Extract<ConfigSourceKind, "profile" | "workflow" | "node">;
  reference?: string;
  config: Partial<WavesConfig>;
}

export interface ConfigurationResolutionRequest {
  builtinDefaults: WavesConfig;
  userConfigPath?: string;
  projectConfigPath?: string;
  overrides?: ConfigurationOverrideLayer[];
  cliOverrides?: Partial<WavesConfig>;
  providerOptionsValidator?: ProviderOptionsValidator;
}
