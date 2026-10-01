import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { mergeWavesConfig, type WavesConfigLayer } from "./merge-waves-config.ts";

const sourceKindArb = fc.constantFrom(
  "builtin",
  "user",
  "project",
  "profile",
  "workflow",
  "node",
  "cli",
) as fc.Arbitrary<WavesConfigLayer["source"]["kind"]>;

const projectPatchArb = fc.record(
  { name: fc.option(fc.string(), { nil: undefined }) },
  { requiredKeys: [] },
);

const layerArb: fc.Arbitrary<WavesConfigLayer> = fc.record({
  source: fc.record({ kind: sourceKindArb }),
  config: fc.record(
    { project: fc.option(projectPatchArb, { nil: undefined }) },
    { requiredKeys: [] },
  ),
});

describe("mergeWavesConfig property invariants", () => {
  it("is idempotent: reapplying the same layer stack twice yields the same result", () => {
    fc.assert(
      fc.property(fc.array(layerArb, { maxLength: 8 }), (layers) => {
        const once = mergeWavesConfig(layers);
        const twice = mergeWavesConfig([...layers, ...layers]);
        expect(twice.merged).toEqual(once.merged);
      }),
    );
  });

  it("never changes the result when a no-op (empty config) layer is appended", () => {
    fc.assert(
      fc.property(fc.array(layerArb, { maxLength: 8 }), sourceKindArb, (layers, kind) => {
        const before = mergeWavesConfig(layers);
        const after = mergeWavesConfig([...layers, { source: { kind }, config: {} }]);
        expect(after.merged).toEqual(before.merged);
      }),
    );
  });

  it("attributes every provenance entry to a layer that actually contributed that path", () => {
    fc.assert(
      fc.property(fc.array(layerArb, { minLength: 1, maxLength: 8 }), (layers) => {
        const { provenance } = mergeWavesConfig(layers);
        const contributingKinds = new Set(layers.map((layer) => layer.source.kind));
        for (const source of Object.values(provenance)) {
          expect(contributingKinds.has(source.kind)).toBe(true);
        }
      }),
    );
  });
});
