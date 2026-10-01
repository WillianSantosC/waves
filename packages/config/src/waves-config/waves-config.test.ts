import { describe, expect, it } from "vitest";
import { wavesConfigSchema } from "./waves-config.ts";

describe("wavesConfigSchema", () => {
  it("accepts a document with only a version", () => {
    expect(wavesConfigSchema.safeParse({ version: 1 }).success).toBe(true);
  });

  it("accepts a fully populated representative document", () => {
    const result = wavesConfigSchema.safeParse({
      version: 1,
      project: { name: "waves" },
      commands: { test: { command: "bun test" } },
      execution: {
        executor: { provider: "claude" },
        parallelism: { maxConcurrentNodes: 2 },
      },
      approvals: { autonomy: "supervised" },
      policies: { requireApprovalForIrreversible: true },
      memory: { projectMemory: { provider: "native" } },
      observability: { telemetry: { provider: "otel" } },
      integrations: { taskSource: { provider: "jira" } },
      ui: { theme: "dark" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing version", () => {
    expect(wavesConfigSchema.safeParse({}).success).toBe(false);
  });

  it("rejects an invalid field within a known domain", () => {
    const result = wavesConfigSchema.safeParse({
      version: 1,
      execution: { parallelism: { maxConcurrentNodes: -1 } },
    });
    expect(result.success).toBe(false);
  });

  it("accepts arbitrary data in reserved placeholder domains", () => {
    const result = wavesConfigSchema.safeParse({
      version: 1,
      workflows: { "builtin:tdd-feature": { anything: true } },
    });
    expect(result.success).toBe(true);
  });
});
