import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export interface FixtureConfigTree {
  root: string;
  userConfigPath: string;
  projectConfigPath: string;
  cleanup(): Promise<void>;
}

/**
 * Writes an optional user config YAML and an optional `.waves/project.yaml`
 * into a fresh temp directory, for exercising `FileConfigurationResolver`
 * against real files. Pass `undefined` for either to omit that file
 * entirely (exercising the "config file is optional" behavior).
 */
export async function writeFixtureConfigTree(files: {
  userConfigYaml?: string;
  projectConfigYaml?: string;
}): Promise<FixtureConfigTree> {
  const root = await mkdtemp(path.join(tmpdir(), "waves-config-"));
  const userConfigPath = path.join(root, "user-config.yaml");
  const projectConfigPath = path.join(root, ".waves", "project.yaml");

  if (files.userConfigYaml !== undefined) {
    await writeFile(userConfigPath, files.userConfigYaml);
  }
  if (files.projectConfigYaml !== undefined) {
    await mkdir(path.dirname(projectConfigPath), { recursive: true });
    await writeFile(projectConfigPath, files.projectConfigYaml);
  }

  return {
    root,
    userConfigPath,
    projectConfigPath,
    async cleanup() {
      await rm(root, { recursive: true, force: true });
    },
  };
}
