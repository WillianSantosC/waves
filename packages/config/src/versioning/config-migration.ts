/**
 * A pure, deterministic transformation from one `WavesConfig` raw schema
 * version to the next. Migrations are applied sequentially by
 * `migrateConfig` and must not have side effects.
 */
export interface ConfigMigration {
  fromVersion: number;
  toVersion: number;
  migrate(raw: Record<string, unknown>): Record<string, unknown>;
}
