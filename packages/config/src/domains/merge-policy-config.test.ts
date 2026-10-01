import { describe, expect, it } from "vitest";
import { ConfigError } from "../configuration-resolver/config-error.ts";
import { mergePolicyConfig } from "./merge-policy-config.ts";

describe("mergePolicyConfig", () => {
  it("takes the stricter (lower) numeric limit across layers", () => {
    const merged = mergePolicyConfig([
      { source: { kind: "builtin" }, policies: { maxRunCostUsd: 50 } },
      { source: { kind: "project" }, policies: { maxRunCostUsd: 10 } },
    ]);
    expect(merged.maxRunCostUsd).toBe(10);
  });

  it("never loosens a limit set by an earlier layer", () => {
    const merged = mergePolicyConfig([
      { source: { kind: "builtin" }, policies: { maxRunCostUsd: 10 } },
      { source: { kind: "project" }, policies: { maxRunCostUsd: 50 } },
    ]);
    expect(merged.maxRunCostUsd).toBe(10);
  });

  it("ORs boolean must-approve flags", () => {
    const merged = mergePolicyConfig([
      { source: { kind: "builtin" }, policies: { requireApprovalForIrreversible: false } },
      { source: { kind: "project" }, policies: { requireApprovalForIrreversible: true } },
    ]);
    expect(merged.requireApprovalForIrreversible).toBe(true);
  });

  it("unions mandatory evidence gates across layers", () => {
    const merged = mergePolicyConfig([
      { source: { kind: "builtin" }, policies: { mandatoryEvidenceGates: ["lint"] } },
      { source: { kind: "project" }, policies: { mandatoryEvidenceGates: ["test"] } },
    ]);
    expect(merged.mandatoryEvidenceGates).toEqual(expect.arrayContaining(["lint", "test"]));
    expect(merged.mandatoryEvidenceGates).toHaveLength(2);
  });

  it("rejects a disallowed source attempting to set policies", () => {
    expect(() =>
      mergePolicyConfig([
        { source: { kind: "builtin" }, policies: {} },
        { source: { kind: "user" }, policies: { maxRunCostUsd: 1000 } },
      ]),
    ).toThrowError(ConfigError);
  });

  it("skips layers with no policies field at all", () => {
    const merged = mergePolicyConfig([
      { source: { kind: "user" }, policies: undefined },
      { source: { kind: "project" }, policies: { maxRunCostUsd: 5 } },
    ]);
    expect(merged.maxRunCostUsd).toBe(5);
  });

  it("retains an already-set field when a later layer leaves it unset", () => {
    const merged = mergePolicyConfig([
      {
        source: { kind: "builtin" },
        policies: {
          maxRunCostUsd: 20,
          maxNodeTimeoutMs: 60_000,
          requireApprovalForIrreversible: true,
          mandatoryEvidenceGates: ["lint"],
        },
      },
      {
        // Sets nothing new for any field: every per-field merge here takes
        // the "incoming value is undefined" branch, which must preserve
        // the previously merged value rather than clearing it.
        source: { kind: "project" },
        policies: {},
      },
    ]);

    expect(merged).toEqual({
      maxRunCostUsd: 20,
      maxNodeTimeoutMs: 60_000,
      requireApprovalForIrreversible: true,
      mandatoryEvidenceGates: ["lint"],
    });
  });
});
