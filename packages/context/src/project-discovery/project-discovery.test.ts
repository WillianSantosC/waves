import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  type FixtureRepository,
  writeFixtureRepository,
  writeFixtureRepositoryWithCommit,
} from "@tests/fixtures/project-discovery/write-fixture-repository.ts";
import { ProjectDiscoveryError } from "./project-discovery-error.ts";
import { discoverProject } from "./project-discovery.ts";

describe("discoverProject", () => {
  let repository: FixtureRepository | undefined;

  afterEach(async () => {
    await repository?.cleanup();
    repository = undefined;
  });

  it("discovers resources, skill locations, and all commands for a JS/TS repository layout", async () => {
    repository = await writeFixtureRepository({
      "package.json": JSON.stringify({
        name: "demo",
        scripts: { test: "vitest run", lint: "eslint .", typecheck: "tsc --noEmit", build: "tsc" },
      }),
      "package-lock.json": "{}",
      "AGENTS.md": "# Agents",
      "README.md": "# Demo",
      ".github/copilot-instructions.md": "# Copilot",
      ".github/workflows/ci.yml": "name: CI\n",
      "docs/adr/0001-example.md": "# ADR",
      "docs/guide.md": "# Guide",
      ".agents/skills/example/SKILL.md": "# Example skill",
    });

    const result = await discoverProject(repository.root);

    expect(result.resources).toEqual(
      expect.arrayContaining([
        { path: "AGENTS.md", kind: "instruction" },
        { path: "README.md", kind: "documentation" },
        { path: ".github/copilot-instructions.md", kind: "instruction" },
        { path: "docs/adr/0001-example.md", kind: "adr" },
        { path: "docs/guide.md", kind: "documentation" },
      ]),
    );
    expect(result.skillLocations).toEqual([".agents/skills"]);
    expect(result.commands.test).toEqual({
      command: "npm run test",
      source: { type: "package-json-script", reference: "package.json#scripts.test" },
    });
    expect(result.commands.lint?.command).toBe("npm run lint");
    expect(result.commands.typecheck?.command).toBe("npm run typecheck");
    expect(result.commands.build?.command).toBe("npm run build");
    expect(result.sourceFingerprints["package.json"]).toBeDefined();
  });

  it("infers Cargo commands for a non-JS repository layout", async () => {
    repository = await writeFixtureRepository({
      "Cargo.toml": '[package]\nname = "demo"\nversion = "0.1.0"\n',
      "src/main.rs": "fn main() {}\n",
    });

    const result = await discoverProject(repository.root);

    expect(result.commands.test?.command).toBe("cargo test");
    expect(result.commands.build?.command).toBe("cargo build");
    expect(result.commands.lint).toBeUndefined();
  });

  it("infers Go commands for a non-JS repository layout", async () => {
    repository = await writeFixtureRepository({
      "go.mod": "module example.com/demo\n\ngo 1.22\n",
      "main.go": "package main\n\nfunc main() {}\n",
    });

    const result = await discoverProject(repository.root);

    expect(result.commands.test?.command).toBe("go test ./...");
    expect(result.commands.build?.command).toBe("go build ./...");
    expect(result.commands.lint).toBeUndefined();
  });

  it("returns empty discovery results for a repository with no recognizable metadata", async () => {
    repository = await writeFixtureRepository({});

    const result = await discoverProject(repository.root);

    expect(result.resources).toEqual([]);
    expect(result.skillLocations).toEqual([]);
    expect(result.commands).toEqual({});
    expect(result.repository.revision).toBeUndefined();
  });

  it("does not guess a command when candidates are ambiguous", async () => {
    repository = await writeFixtureRepository({
      "package.json": JSON.stringify({
        name: "demo",
        scripts: { "test:unit": "vitest run unit", "test:e2e": "vitest run e2e" },
      }),
    });

    const result = await discoverProject(repository.root);

    expect(result.commands.test).toBeUndefined();
  });

  it("discovers nested instruction sources across the repository tree", async () => {
    repository = await writeFixtureRepository({
      "AGENTS.md": "# Root agents",
      "packages/foo/AGENTS.md": "# Foo agents",
      ".cursor/rules/style.mdc": "# Style rule",
      "docs/architecture/overview.md": "# Overview",
    });

    const result = await discoverProject(repository.root);

    expect(result.resources).toEqual(
      expect.arrayContaining([
        { path: "AGENTS.md", kind: "instruction" },
        { path: "packages/foo/AGENTS.md", kind: "instruction" },
        { path: ".cursor/rules/style.mdc", kind: "instruction" },
        { path: "docs/architecture/overview.md", kind: "architecture" },
      ]),
    );
  });

  it("resolves the repository revision when the repository has a commit", async () => {
    repository = await writeFixtureRepositoryWithCommit({ "README.md": "# Demo" });

    const result = await discoverProject(repository.root);

    expect(result.repository.revision).toMatch(/^[0-9a-f]{40}$/);
  });

  it("throws a structured ProjectDiscoveryError when the repository root does not exist", async () => {
    const missingDir = path.join(tmpdir(), "waves-project-discovery-missing-dir");

    await expect(discoverProject(missingDir)).rejects.toMatchObject({
      name: "ProjectDiscoveryError",
      category: "OPERATIONAL",
      code: "DISCOVERY_REPOSITORY_ROOT_NOT_FOUND",
      retryable: false,
    });
    await expect(discoverProject(missingDir)).rejects.toBeInstanceOf(ProjectDiscoveryError);
  });

  it("throws a structured ProjectDiscoveryError when the repository root is a file, not a directory", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "waves-project-discovery-file-"));
    const filePath = path.join(tempDir, "not-a-directory.txt");
    await writeFile(filePath, "not a directory");

    try {
      await expect(discoverProject(filePath)).rejects.toMatchObject({
        name: "ProjectDiscoveryError",
        code: "DISCOVERY_REPOSITORY_ROOT_NOT_FOUND",
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("is deterministic and repeatable for the same repository state", async () => {
    repository = await writeFixtureRepository({
      "package.json": JSON.stringify({ name: "demo", scripts: { test: "vitest run" } }),
      "AGENTS.md": "# Agents",
    });

    const first = await discoverProject(repository.root);
    const second = await discoverProject(repository.root);

    const strip = ({ discoveredAt, ...rest }: typeof first) => rest;
    expect(strip(second)).toEqual(strip(first));
  });
});
