import { stat } from "node:fs/promises";
import path from "node:path";

const CANDIDATE_SKILL_DIRECTORIES = [".waves/skills", ".agents/skills", ".claude/skills"];

/**
 * Reports which supported skill directories exist in the repository.
 * Locations only — their contents are never read or executed here.
 */
export async function discoverSkillLocations(repositoryRoot: string): Promise<string[]> {
  const found: string[] = [];

  for (const relativePath of CANDIDATE_SKILL_DIRECTORIES) {
    const exists = await isDirectory(path.join(repositoryRoot, relativePath));
    if (exists) {
      found.push(relativePath);
    }
  }

  return found.sort();
}

async function isDirectory(absolutePath: string): Promise<boolean> {
  try {
    const stats = await stat(absolutePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}
