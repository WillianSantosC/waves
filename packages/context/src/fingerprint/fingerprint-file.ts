import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

/**
 * Content-addressed fingerprint for a discovered file, used to detect
 * changes between discovery runs without re-running full discovery.
 */
export async function fingerprintFile(absolutePath: string): Promise<string> {
  const content = await readFile(absolutePath);
  return createHash("sha256").update(content).digest("hex");
}
