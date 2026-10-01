import { readFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import { mergePolicyConfig } from "../domains/merge-policy-config.ts";
import { mergeWavesConfig, type WavesConfigLayer } from "../merge/merge-waves-config.ts";
import type { ConfigSource, ConfigSourceKind } from "../provenance/config-source.ts";
import type { ResolvedConfig } from "../resolved-config/resolved-config.ts";
import { BUILTIN_CONFIG_MIGRATIONS } from "../versioning/builtin-migrations.ts";
import { migrateConfig } from "../versioning/config-migration-registry.ts";
import { wavesConfigSchema, type WavesConfig } from "../waves-config/waves-config.ts";
import { ConfigError } from "./config-error.ts";
import type { ConfigurationExplanation } from "./configuration-explanation.ts";
import type { ConfigurationResolutionRequest } from "./configuration-resolution-request.ts";
import type { ConfigurationResolver } from "./configuration-resolver.ts";
import type { ConfigurationValidationResult } from "./configuration-validation-result.ts";

/**
 * Top-level `WavesConfig` domains a user-level config file may set.
 * Everything else represents shared project execution behavior
 * (commands, execution, policies, context, evidence, memory,
 * observability, integrations, agents, workflows, approvals) per
 * architecture-v0.1.md §5.3, and is rejected at the user layer.
 */
const USER_ALLOWED_DOMAINS: ReadonlySet<string> = new Set(["version", "ui"]);

/**
 * Reads optional user/project YAML config files plus programmatic
 * overrides, migrates, merges, validates, and returns a `ResolvedConfig`.
 * A missing user or project config file is treated as an empty layer, not
 * an error — `.waves/project.yaml` stays optional.
 */
export class FileConfigurationResolver implements ConfigurationResolver {
  async resolve(request: ConfigurationResolutionRequest): Promise<ResolvedConfig> {
    const userRaw = await readOptionalYamlFile(request.userConfigPath);
    if (userRaw !== undefined) {
      assertUserConfigOwnership(userRaw);
    }
    const projectRaw = await readOptionalYamlFile(request.projectConfigPath);

    const userConfig = migrateOrEmpty(userRaw);
    const projectConfig = migrateOrEmpty(projectRaw);
    const userSource = buildSource("user", request.userConfigPath);
    const projectSource = buildSource("project", request.projectConfigPath);

    const layers = buildLayers(request, {
      userConfig,
      userSource,
      projectConfig,
      projectSource,
    });
    const { merged, provenance } = mergeWavesConfig(layers);

    const policies = mergePolicyConfig([
      {
        source: { kind: "builtin" },
        policies: request.builtinDefaults.policies,
      },
      {
        source: projectSource,
        policies: (projectConfig as Partial<WavesConfig>).policies,
      },
    ]);

    const resolvedVersion =
      typeof merged.version === "number" ? merged.version : request.builtinDefaults.version;
    const parsed = wavesConfigSchema.safeParse({
      ...merged,
      version: resolvedVersion,
      policies,
    });
    if (!parsed.success) {
      throw new ConfigError({
        code: "INVALID_CONFIG",
        message: `Resolved configuration failed validation: ${parsed.error.message}`,
        details: { issues: parsed.error.issues },
      });
    }

    return {
      version: parsed.data.version,
      values: parsed.data,
      provenance,
      policySnapshot: {
        policies,
        source: hasAnyPolicy(policies) ? projectSource : { kind: "builtin" },
      },
      resolvedAt: new Date(),
    };
  }

  async validate(input: unknown): Promise<ConfigurationValidationResult> {
    const result = wavesConfigSchema.safeParse(input);
    if (result.success) {
      return { valid: true };
    }
    return {
      valid: false,
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  async explain(resolved: ResolvedConfig, path?: string): Promise<ConfigurationExplanation> {
    const entries = Object.entries(resolved.provenance)
      .filter(
        ([entryPath]) =>
          path === undefined || entryPath === path || entryPath.startsWith(`${path}.`),
      )
      .map(([entryPath, source]) => ({
        path: entryPath,
        value: readPath(resolved.values, entryPath),
        source,
      }));
    return { entries };
  }
}

async function readOptionalYamlFile(
  filePath: string | undefined,
): Promise<Record<string, unknown> | undefined> {
  if (filePath === undefined) {
    return undefined;
  }
  let content: string;
  try {
    content = await readFile(filePath, "utf8");
  } catch (error) {
    if (isNodeNotFoundError(error)) {
      return undefined;
    }
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(content);
  } catch (error) {
    throw new ConfigError({
      code: "INVALID_CONFIG",
      message: `Failed to parse YAML configuration at "${filePath}": ${(error as Error).message}`,
      details: { filePath },
    });
  }

  if (parsed === null || parsed === undefined) {
    return {};
  }
  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ConfigError({
      code: "INVALID_CONFIG",
      message: `Configuration at "${filePath}" must be a YAML mapping at the top level.`,
      details: { filePath },
    });
  }
  return parsed as Record<string, unknown>;
}

function isNodeNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}

function assertUserConfigOwnership(userRaw: Record<string, unknown>): void {
  for (const key of Object.keys(userRaw)) {
    if (!USER_ALLOWED_DOMAINS.has(key)) {
      throw new ConfigError({
        code: "USER_CONFIG_FORBIDDEN_FIELD",
        message: `"${key}" is shared project execution behavior and cannot be set from user-level config.`,
        details: { field: key },
      });
    }
  }
}

function migrateOrEmpty(raw: Record<string, unknown> | undefined): Record<string, unknown> {
  return raw !== undefined ? migrateConfig(raw, BUILTIN_CONFIG_MIGRATIONS) : {};
}

function buildSource(kind: ConfigSourceKind, reference: string | undefined): ConfigSource {
  return reference !== undefined ? { kind, reference } : { kind };
}

function hasAnyPolicy(policies: ReturnType<typeof mergePolicyConfig>): boolean {
  return (
    policies.maxRunCostUsd !== undefined ||
    policies.maxNodeTimeoutMs !== undefined ||
    policies.requireApprovalForIrreversible !== undefined ||
    policies.mandatoryEvidenceGates !== undefined
  );
}

interface FileBackedLayers {
  userConfig: Record<string, unknown>;
  userSource: ConfigSource;
  projectConfig: Record<string, unknown>;
  projectSource: ConfigSource;
}

function buildLayers(
  request: ConfigurationResolutionRequest,
  { userConfig, userSource, projectConfig, projectSource }: FileBackedLayers,
): WavesConfigLayer[] {
  const overrideLayers: WavesConfigLayer[] = (request.overrides ?? []).map((override) => ({
    source: buildSource(override.kind, override.reference) as ConfigSource,
    config: override.config,
  }));
  const cliLayer: WavesConfigLayer[] =
    request.cliOverrides !== undefined
      ? [
          {
            source: { kind: "cli" as ConfigSourceKind },
            config: request.cliOverrides,
          },
        ]
      : [];

  return [
    { source: { kind: "builtin" }, config: request.builtinDefaults },
    { source: userSource, config: userConfig as Partial<WavesConfig> },
    { source: projectSource, config: projectConfig as Partial<WavesConfig> },
    ...overrideLayers,
    ...cliLayer,
  ];
}

function readPath(values: WavesConfig, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((current, segment) => {
    if (typeof current === "object" && current !== null && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, values);
}
