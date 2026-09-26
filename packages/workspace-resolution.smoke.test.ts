import { describe, expect, it } from "vitest";

const PACKAGES = [
  "core",
  "workflow",
  "context",
  "memory",
  "state",
  "artifacts",
  "executors",
  "runtimes",
  "evidence",
  "review",
  "skills",
  "workspaces",
] as const;

describe("workspace package resolution", () => {
  it.each(PACKAGES)("@waves/%s resolves via its workspace package name", async (name) => {
    const module = (await import(`@waves/${name}`)) as { PACKAGE_NAME: string };

    expect(module.PACKAGE_NAME).toBe(`@waves/${name}`);
  });
});
