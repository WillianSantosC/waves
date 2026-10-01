import { describe, expect, it } from "vitest";
import { ConfigError } from "../configuration-resolver/config-error.ts";
import type { ConfigMigration } from "./config-migration.ts";
import { migrateConfig } from "./config-migration-registry.ts";

describe("migrateConfig", () => {
  it("returns the document unchanged when already at the current version", () => {
    const raw = { version: 1, project: { name: "demo" } };
    expect(migrateConfig(raw, [])).toEqual(raw);
  });

  it("applies migrations sequentially across multiple version hops", () => {
    const migrations: ConfigMigration[] = [
      {
        fromVersion: -1,
        toVersion: 0,
        migrate: (old) => ({ ...old, version: 0, migratedThroughMinusOne: true }),
      },
      {
        fromVersion: 0,
        toVersion: 1,
        migrate: (old) => ({ ...old, version: 1, migratedThroughZero: true }),
      },
    ];
    expect(migrateConfig({ version: -1 }, migrations)).toEqual({
      version: 1,
      migratedThroughMinusOne: true,
      migratedThroughZero: true,
    });
  });

  it("throws UNSUPPORTED_CONFIG_VERSION when no migration path exists", () => {
    expect(() => migrateConfig({ version: 0 }, [])).toThrowError(ConfigError);
    try {
      migrateConfig({ version: 0 }, []);
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError);
      expect((error as ConfigError).code).toBe("UNSUPPORTED_CONFIG_VERSION");
    }
  });

  it("throws INVALID_CONFIG when version is missing or not a number", () => {
    expect(() => migrateConfig({})).toThrowError(ConfigError);
  });
});
