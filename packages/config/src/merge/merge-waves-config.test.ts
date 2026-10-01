import { describe, expect, it } from "vitest";
import { mergeWavesConfig, type WavesConfigLayer } from "./merge-waves-config.ts";

describe("mergeWavesConfig", () => {
  it("deep-merges nested objects, overwriting only the keys present in the higher layer", () => {
    const layers: WavesConfigLayer[] = [
      {
        source: { kind: "builtin" },
        config: {
          execution: { parallelism: { maxConcurrentNodes: 1 }, timeouts: { nodeTimeoutMs: 1000 } },
        },
      },
      {
        source: { kind: "project" },
        config: { execution: { parallelism: { maxConcurrentNodes: 4 } } },
      },
    ];

    const { merged, provenance } = mergeWavesConfig(layers);

    expect(merged).toMatchObject({
      execution: {
        parallelism: { maxConcurrentNodes: 4 },
        timeouts: { nodeTimeoutMs: 1000 },
      },
    });
    expect(provenance["execution.parallelism.maxConcurrentNodes"]).toEqual({ kind: "project" });
    expect(provenance["execution.timeouts.nodeTimeoutMs"]).toEqual({ kind: "builtin" });
  });

  it("replaces arrays wholesale rather than splicing them across layers", () => {
    const arrayLayers: WavesConfigLayer[] = [
      {
        source: { kind: "builtin" },
        config: { tags: ["a", "b"] } as unknown as Partial<WavesConfigLayer["config"]>,
      },
      {
        source: { kind: "project" },
        config: { tags: ["c"] } as unknown as Partial<WavesConfigLayer["config"]>,
      },
    ];
    const { merged, provenance } = mergeWavesConfig(arrayLayers);
    expect(merged.tags).toEqual(["c"]);
    expect(provenance.tags).toEqual({ kind: "project" });
  });

  it("overrides scalars with the highest layer's value", () => {
    const { merged, provenance } = mergeWavesConfig([
      { source: { kind: "builtin" }, config: { project: { name: "builtin-name" } } },
      { source: { kind: "user" }, config: {} },
      { source: { kind: "project" }, config: { project: { name: "project-name" } } },
    ]);
    expect(merged).toMatchObject({ project: { name: "project-name" } });
    expect(provenance["project.name"]).toEqual({ kind: "project" });
  });

  it("preserves a lower layer's value and provenance when a higher layer omits the key", () => {
    const { merged, provenance } = mergeWavesConfig([
      { source: { kind: "builtin" }, config: { project: { name: "builtin-name" } } },
      { source: { kind: "cli" }, config: { project: {} } },
    ]);
    expect(merged).toMatchObject({ project: { name: "builtin-name" } });
    expect(provenance["project.name"]).toEqual({ kind: "builtin" });
  });

  it("excludes policies from the normal merge walk entirely", () => {
    const { merged } = mergeWavesConfig([
      { source: { kind: "builtin" }, config: { policies: { maxRunCostUsd: 100 } } },
    ]);
    expect(merged.policies).toBeUndefined();
  });

  it("establishes full 7-layer precedence ordering", () => {
    const order: WavesConfigLayer["source"]["kind"][] = [
      "builtin",
      "user",
      "project",
      "profile",
      "workflow",
      "node",
      "cli",
    ];
    const layers: WavesConfigLayer[] = order.map((kind) => ({
      source: { kind },
      config: { project: { name: kind } },
    }));

    const { merged, provenance } = mergeWavesConfig(layers);
    expect(merged).toMatchObject({ project: { name: "cli" } });
    expect(provenance["project.name"]).toEqual({ kind: "cli" });
  });
});
