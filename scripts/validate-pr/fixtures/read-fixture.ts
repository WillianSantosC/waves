import { readFileSync } from "node:fs";
import { join } from "node:path";

const SHARED_FIXTURES_DIR = import.meta.dirname;

export function readSharedFixture(name: string): string {
  return readFileSync(join(SHARED_FIXTURES_DIR, name), "utf8");
}

export function readValidatorFixture(baseDir: string, name: string): string {
  return readFileSync(join(baseDir, "fixtures", name), "utf8");
}
