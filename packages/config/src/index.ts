export const PACKAGE_NAME = "@waves/config";

export { wavesConfigSchema } from "./waves-config/waves-config.ts";
export type { WavesConfig } from "./waves-config/waves-config.ts";

export type { ConfigSourceKind, ConfigSource } from "./provenance/config-source.ts";
export { configSourceKindSchema, configSourceSchema } from "./provenance/config-source.ts";
export type { ResolvedValue } from "./provenance/resolved-value.ts";
export type { ProvenanceMap } from "./provenance/provenance-map.ts";
export { getProvenance, setProvenance } from "./provenance/provenance-map.ts";

export type { ResolvedConfig } from "./resolved-config/resolved-config.ts";
export type { PolicySnapshot } from "./resolved-config/policy-snapshot.ts";

export type { ProviderReference } from "./provider-reference/provider-reference.ts";
export { providerReferenceSchema } from "./provider-reference/provider-reference.ts";
export type { ProviderOptionsValidator } from "./provider-reference/provider-options-validator.ts";
export { permissiveProviderOptionsValidator } from "./provider-reference/provider-options-validator.ts";

export type { SecretReference } from "./secrets/secret-reference.ts";
export { secretReferenceSchema } from "./secrets/secret-reference.ts";

export type { ConfigMigration } from "./versioning/config-migration.ts";
export { migrateConfig } from "./versioning/config-migration-registry.ts";
export { CURRENT_WAVES_CONFIG_VERSION } from "./versioning/waves-config-version.ts";
export { BUILTIN_CONFIG_MIGRATIONS } from "./versioning/builtin-migrations.ts";

export { mergeWavesConfig } from "./merge/merge-waves-config.ts";
export type { WavesConfigLayer, MergeWavesConfigResult } from "./merge/merge-waves-config.ts";

export { mergePolicyConfig } from "./domains/merge-policy-config.ts";
export type { PolicyConfigLayer } from "./domains/merge-policy-config.ts";
export type { PolicyConfig } from "./domains/policy-config.ts";
export type { ProjectConfig } from "./domains/project-config.ts";
export type { CommandsConfig } from "./domains/commands-config.ts";
export type { ExecutionConfig } from "./domains/execution-config.ts";
export type { ApprovalConfig } from "./domains/approval-config.ts";
export type { MemoryConfig } from "./domains/memory-config.ts";
export type { ObservabilityConfig } from "./domains/observability-config.ts";
export type { IntegrationConfig } from "./domains/integration-config.ts";
export type { UiConfig } from "./domains/ui-config.ts";

export type { ConfigurationResolver } from "./configuration-resolver/configuration-resolver.ts";
export type {
  ConfigurationResolutionRequest,
  ConfigurationOverrideLayer,
} from "./configuration-resolver/configuration-resolution-request.ts";
export type { ConfigurationValidationResult } from "./configuration-resolver/configuration-validation-result.ts";
export type { ConfigurationExplanation } from "./configuration-resolver/configuration-explanation.ts";
export { ConfigError } from "./configuration-resolver/config-error.ts";
export type { ConfigErrorCode } from "./configuration-resolver/config-error.ts";
export { FileConfigurationResolver } from "./configuration-resolver/file-configuration-resolver.ts";

export { computeConfigSnapshot } from "./snapshot/config-snapshot.ts";
export type { ConfigSnapshot } from "./snapshot/config-snapshot.ts";
