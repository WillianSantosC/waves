import { describe, expect, it } from "vitest";
import { runCommand } from "./command-runner.ts";

describe("runCommand", () => {
  it("captures stdout and a zero exit code on success", async () => {
    const result = await runCommand("echo", ["hello"], { cwd: process.cwd() });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("hello");
    expect(result.spawnError).toBeUndefined();
  });

  it("captures a non-zero exit code without throwing", async () => {
    const result = await runCommand("sh", ["-c", "exit 7"], { cwd: process.cwd() });

    expect(result.exitCode).toBe(7);
  });

  it("passes arguments as an array, never interpolated into a shell string", async () => {
    const result = await runCommand("echo", ["$(echo injected)"], { cwd: process.cwd() });

    expect(result.stdout).toBe("$(echo injected)");
  });

  it("reports spawnError instead of a fabricated exit code when the process never starts (cwd does not exist)", async () => {
    const missingCwd = "/waves-cwd-that-does-not-exist";

    const result = await runCommand("echo", ["hello"], { cwd: missingCwd });

    expect(result.spawnError).toBeDefined();
    expect(typeof result.spawnError).toBe("string");
  });
});
