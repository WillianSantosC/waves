import { afterEach, describe, expect, it } from "vitest";
import {
  type FixtureRepository,
  writeFixtureRepository,
} from "@tests/fixtures/project-discovery/write-fixture-repository.ts";
import { discoverManifests } from "./discover-manifests.ts";

describe("discoverManifests", () => {
  let repository: FixtureRepository | undefined;

  afterEach(async () => {
    await repository?.cleanup();
    repository = undefined;
  });

  it("treats a package.json with no scripts field as having no scripts", async () => {
    repository = await writeFixtureRepository({
      "package.json": JSON.stringify({ name: "demo" }),
    });

    const result = await discoverManifests(repository.root, ["package.json"]);

    expect(result.packageJson).toEqual({ path: "package.json", scripts: {} });
  });

  it("ignores a scripts field that is not a string-keyed object", async () => {
    repository = await writeFixtureRepository({
      "package.json": JSON.stringify({ name: "demo", scripts: ["not", "an", "object"] }),
    });

    const result = await discoverManifests(repository.root, ["package.json"]);

    expect(result.packageJson).toEqual({ path: "package.json", scripts: {} });
  });

  it("reports no package.json manifest when the file contains invalid JSON", async () => {
    repository = await writeFixtureRepository({
      "package.json": "{ not valid json",
    });

    const result = await discoverManifests(repository.root, ["package.json"]);

    expect(result.packageJson).toBeUndefined();
  });

  it("reports pyproject.toml by presence only, without parsing it", async () => {
    repository = await writeFixtureRepository({
      "pyproject.toml": '[project]\nname = "demo"\n',
    });

    const result = await discoverManifests(repository.root, ["pyproject.toml"]);

    expect(result.pyprojectTomlPath).toBe("pyproject.toml");
  });
});
