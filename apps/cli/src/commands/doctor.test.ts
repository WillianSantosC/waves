import { describe, expect, it } from "vitest";
import { runDoctor } from "./doctor.ts";

describe("runDoctor", () => {
  it("reports on the current runtime", () => {
    const report = runDoctor();

    expect(report.lines.length).toBeGreaterThan(0);
    expect(report.lines.some((line) => line.includes("Node engine"))).toBe(true);
  });
});
