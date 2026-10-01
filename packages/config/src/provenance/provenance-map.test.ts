import { describe, expect, it } from "vitest";
import { getProvenance, setProvenance, type ProvenanceMap } from "./provenance-map.ts";

describe("provenance map", () => {
  it("round-trips a source by dot-path", () => {
    const map: ProvenanceMap = {};
    setProvenance(map, "execution.parallelism.maxConcurrentNodes", {
      kind: "project",
      reference: ".waves/project.yaml",
    });

    expect(getProvenance(map, "execution.parallelism.maxConcurrentNodes")).toEqual({
      kind: "project",
      reference: ".waves/project.yaml",
    });
    expect(getProvenance(map, "missing.path")).toBeUndefined();
  });
});
