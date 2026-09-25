import { describe, expect, it } from "vitest";
import { createCli } from "./cli.ts";

describe("createCli", () => {
  it("creates a parser named waves with a version", () => {
    const program = createCli();

    expect(program.name()).toBe("waves");
    expect(program.version()).toBe("0.0.0");
  });

  it("registers the doctor command", () => {
    const program = createCli();

    expect(program.commands.map((command) => command.name())).toContain("doctor");
  });
});
