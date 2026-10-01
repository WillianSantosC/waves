import { afterEach, describe, expect, it } from "vitest";
import {
  type FixtureConfigTree,
  writeFixtureConfigTree,
} from "@tests/fixtures/config/write-fixture-config-tree.ts";
import { ConfigError } from "./config-error.ts";
import { FileConfigurationResolver } from "./file-configuration-resolver.ts";
import type { WavesConfig } from "../waves-config/waves-config.ts";

const builtinDefaults: WavesConfig = {
  version: 1,
  execution: { parallelism: { maxConcurrentNodes: 1 } },
};

describe("FileConfigurationResolver", () => {
  let fixture: FixtureConfigTree | undefined;

  afterEach(async () => {
    await fixture?.cleanup();
    fixture = undefined;
  });

  it("resolves when both user and project config files are present", async () => {
    fixture = await writeFixtureConfigTree({
      userConfigYaml: "version: 1\nui:\n  theme: dark\n",
      projectConfigYaml:
        "version: 1\nproject:\n  name: demo\nexecution:\n  parallelism:\n    maxConcurrentNodes: 4\n",
    });

    const resolver = new FileConfigurationResolver();
    const resolved = await resolver.resolve({
      builtinDefaults,
      userConfigPath: fixture.userConfigPath,
      projectConfigPath: fixture.projectConfigPath,
    });

    expect(resolved.values.ui?.theme).toBe("dark");
    expect(resolved.values.project?.name).toBe("demo");
    expect(resolved.values.execution?.parallelism?.maxConcurrentNodes).toBe(4);
    expect(resolved.provenance["ui.theme"]).toEqual({
      kind: "user",
      reference: fixture.userConfigPath,
    });
  });

  it("resolves via defaults alone when .waves/project.yaml is absent", async () => {
    fixture = await writeFixtureConfigTree({});

    const resolver = new FileConfigurationResolver();
    const resolved = await resolver.resolve({
      builtinDefaults,
      projectConfigPath: fixture.projectConfigPath,
    });

    expect(resolved.values.execution?.parallelism?.maxConcurrentNodes).toBe(1);
  });

  it("applies CLI overrides at the highest precedence", async () => {
    fixture = await writeFixtureConfigTree({
      projectConfigYaml: "version: 1\nexecution:\n  parallelism:\n    maxConcurrentNodes: 4\n",
    });

    const resolver = new FileConfigurationResolver();
    const resolved = await resolver.resolve({
      builtinDefaults,
      projectConfigPath: fixture.projectConfigPath,
      cliOverrides: { execution: { parallelism: { maxConcurrentNodes: 8 } } },
    });

    expect(resolved.values.execution?.parallelism?.maxConcurrentNodes).toBe(8);
    expect(resolved.provenance["execution.parallelism.maxConcurrentNodes"]).toEqual({
      kind: "cli",
    });
  });

  it("round-trips a provider reference field", async () => {
    fixture = await writeFixtureConfigTree({
      projectConfigYaml:
        "version: 1\nexecution:\n  executor:\n    provider: claude\n    options:\n      model: opus\n",
    });

    const resolver = new FileConfigurationResolver();
    const resolved = await resolver.resolve({
      builtinDefaults,
      projectConfigPath: fixture.projectConfigPath,
    });

    expect(resolved.values.execution?.executor).toEqual({
      provider: "claude",
      options: { model: "opus" },
    });
  });

  it("throws an actionable ConfigError on malformed YAML", async () => {
    fixture = await writeFixtureConfigTree({
      projectConfigYaml: "version: 1\n  bad indentation: [unterminated\n",
    });

    const resolver = new FileConfigurationResolver();
    await expect(
      resolver.resolve({ builtinDefaults, projectConfigPath: fixture.projectConfigPath }),
    ).rejects.toThrow(ConfigError);
  });

  it("rejects shared execution-behavior fields set at the user-config layer", async () => {
    fixture = await writeFixtureConfigTree({
      userConfigYaml: "version: 1\nexecution:\n  parallelism:\n    maxConcurrentNodes: 99\n",
    });

    const resolver = new FileConfigurationResolver();
    await expect(
      resolver.resolve({ builtinDefaults, userConfigPath: fixture.userConfigPath }),
    ).rejects.toThrow(ConfigError);
  });

  it("applies profile/workflow/node overrides, including an override with no reference", async () => {
    fixture = await writeFixtureConfigTree({
      projectConfigYaml: "version: 1\nexecution:\n  parallelism:\n    maxConcurrentNodes: 2\n",
    });

    const resolver = new FileConfigurationResolver();
    const resolved = await resolver.resolve({
      builtinDefaults,
      projectConfigPath: fixture.projectConfigPath,
      overrides: [
        {
          kind: "workflow",
          reference: "builtin:tdd-feature",
          config: { execution: { parallelism: { maxConcurrentNodes: 6 } } },
        },
        {
          kind: "node",
          config: { execution: { timeouts: { nodeTimeoutMs: 5000 } } },
        },
      ],
    });

    expect(resolved.values.execution?.parallelism?.maxConcurrentNodes).toBe(6);
    expect(resolved.provenance["execution.parallelism.maxConcurrentNodes"]).toEqual({
      kind: "workflow",
      reference: "builtin:tdd-feature",
    });
    expect(resolved.values.execution?.timeouts?.nodeTimeoutMs).toBe(5000);
    expect(resolved.provenance["execution.timeouts.nodeTimeoutMs"]).toEqual({ kind: "node" });
  });

  it("rejects a top-level YAML document that is not a mapping", async () => {
    fixture = await writeFixtureConfigTree({
      projectConfigYaml: "- 1\n- 2\n",
    });

    const resolver = new FileConfigurationResolver();
    await expect(
      resolver.resolve({ builtinDefaults, projectConfigPath: fixture.projectConfigPath }),
    ).rejects.toThrow(ConfigError);
  });

  it("rethrows a non-missing-file error instead of treating it as an absent config file", async () => {
    fixture = await writeFixtureConfigTree({});
    // Point at a directory, not a file, so `readFile` fails with EISDIR
    // rather than ENOENT — this must not be treated as "file absent".
    const directoryAsConfigPath = fixture.root;

    const resolver = new FileConfigurationResolver();
    await expect(
      resolver.resolve({ builtinDefaults, projectConfigPath: directoryAsConfigPath }),
    ).rejects.toThrow();
  });

  it("validates a well-formed and an invalid WavesConfig document", async () => {
    const resolver = new FileConfigurationResolver();

    await expect(resolver.validate({ version: 1, ui: { theme: "dark" } })).resolves.toEqual({
      valid: true,
    });

    const result = await resolver.validate({
      version: 1,
      execution: { parallelism: { maxConcurrentNodes: -1 } },
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.path).toContain("execution");
    }
  });

  it("explains resolved provenance, optionally filtered to a path prefix", async () => {
    fixture = await writeFixtureConfigTree({
      projectConfigYaml: "version: 1\nproject:\n  name: demo\nui:\n  theme: dark\n",
    });

    const resolver = new FileConfigurationResolver();
    const resolved = await resolver.resolve({
      builtinDefaults,
      projectConfigPath: fixture.projectConfigPath,
    });

    const all = await resolver.explain(resolved);
    expect(all.entries.map((entry) => entry.path)).toEqual(
      expect.arrayContaining(["project.name", "ui.theme"]),
    );

    const onlyProject = await resolver.explain(resolved, "project");
    expect(onlyProject.entries).toEqual([
      {
        path: "project.name",
        value: "demo",
        source: { kind: "project", reference: fixture.projectConfigPath },
      },
    ]);

    const exactMatch = await resolver.explain(resolved, "project.name");
    expect(exactMatch.entries).toHaveLength(1);
    expect(exactMatch.entries[0]?.value).toBe("demo");
  });
});
