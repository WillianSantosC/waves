import { describe, expect, it } from "vitest";
import type { ResolvedConfig } from "../resolved-config/resolved-config.ts";
import { computeConfigSnapshot } from "./config-snapshot.ts";

function makeResolved(overrides?: Partial<ResolvedConfig>): ResolvedConfig {
  return {
    version: 1,
    values: { version: 1, project: { name: "demo" }, ui: { theme: "dark" } },
    provenance: {
      "project.name": { kind: "builtin" },
      "ui.theme": { kind: "user" },
    },
    policySnapshot: { policies: {}, source: { kind: "builtin" } },
    resolvedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("computeConfigSnapshot", () => {
  it("produces a stable hash regardless of object key insertion order", () => {
    const a = makeResolved({
      values: { version: 1, project: { name: "demo" }, ui: { theme: "dark" } },
    });
    const b = makeResolved({
      values: { ui: { theme: "dark" }, project: { name: "demo" }, version: 1 },
    });

    expect(computeConfigSnapshot(a).hash).toBe(computeConfigSnapshot(b).hash);
  });

  it("produces a different hash when content differs", () => {
    const a = makeResolved();
    const b = makeResolved({
      values: { version: 1, project: { name: "different" } },
    });

    expect(computeConfigSnapshot(a).hash).not.toBe(computeConfigSnapshot(b).hash);
  });

  it("hashes array-valued fields consistently and is sensitive to array order", () => {
    const a = makeResolved({
      values: { version: 1, policies: { mandatoryEvidenceGates: ["lint", "test"] } },
    });
    const sameOrder = makeResolved({
      values: { version: 1, policies: { mandatoryEvidenceGates: ["lint", "test"] } },
    });
    const reordered = makeResolved({
      values: { version: 1, policies: { mandatoryEvidenceGates: ["test", "lint"] } },
    });

    expect(computeConfigSnapshot(a).hash).toBe(computeConfigSnapshot(sameOrder).hash);
    expect(computeConfigSnapshot(a).hash).not.toBe(computeConfigSnapshot(reordered).hash);
  });

  it("copies version/values/provenance and stamps a fresh capturedAt", () => {
    const resolved = makeResolved();
    const snapshot = computeConfigSnapshot(resolved);

    expect(snapshot.version).toBe(resolved.version);
    expect(snapshot.values).toEqual(resolved.values);
    expect(snapshot.provenance).toEqual(resolved.provenance);
    expect(snapshot.capturedAt).toBeInstanceOf(Date);
  });
});
