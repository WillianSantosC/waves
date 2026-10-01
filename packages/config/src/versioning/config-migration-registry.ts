import { ConfigError } from "../configuration-resolver/config-error.ts";
import type { ConfigMigration } from "./config-migration.ts";
import { CURRENT_WAVES_CONFIG_VERSION } from "./waves-config-version.ts";

/**
 * Migrates a raw configuration document forward to
 * `CURRENT_WAVES_CONFIG_VERSION`, applying registered migrations
 * sequentially. A document already at the current version is returned
 * unchanged. Throws `ConfigError UNSUPPORTED_CONFIG_VERSION` when no
 * migration chain reaches the current version.
 */
export function migrateConfig(
  raw: Record<string, unknown>,
  registry: ConfigMigration[] = [],
): Record<string, unknown> {
  const startVersion = raw.version;
  if (typeof startVersion !== "number") {
    throw new ConfigError({
      code: "INVALID_CONFIG",
      message: `Configuration document is missing a numeric "version" field.`,
      details: { raw },
    });
  }

  let current = raw;
  let currentVersion = startVersion;

  while (currentVersion !== CURRENT_WAVES_CONFIG_VERSION) {
    const migration = registry.find((candidate) => candidate.fromVersion === currentVersion);
    if (migration === undefined) {
      throw new ConfigError({
        code: "UNSUPPORTED_CONFIG_VERSION",
        message: `No migration path from version ${currentVersion} to version ${CURRENT_WAVES_CONFIG_VERSION}.`,
        details: { fromVersion: currentVersion, toVersion: CURRENT_WAVES_CONFIG_VERSION },
      });
    }
    current = migration.migrate(current);
    currentVersion = migration.toVersion;
  }

  return current;
}
