import type { ConfigMigration } from "./config-migration.ts";

/**
 * Registered schema migrations, ordered by `fromVersion`. Empty today
 * because only version 1 exists; add one entry here per future version
 * bump instead of hand-rolling ad hoc upgrade logic elsewhere.
 */
export const BUILTIN_CONFIG_MIGRATIONS: ConfigMigration[] = [];
