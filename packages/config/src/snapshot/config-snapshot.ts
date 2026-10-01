import { createHash } from "node:crypto";
import type { ProvenanceMap } from "../provenance/provenance-map.ts";
import type { ResolvedConfig } from "../resolved-config/resolved-config.ts";
import type { WavesConfig } from "../waves-config/waves-config.ts";

/**
 * A serializable, content-hashed snapshot of a `ResolvedConfig`. This
 * package only produces this value; persisting it keyed by a
 * `WorkflowRun.configSnapshotId` is `packages/state`'s job (stub today),
 * not this package's — it is not touched here.
 */
export interface ConfigSnapshot {
  hash: string;
  version: number;
  values: WavesConfig;
  provenance: ProvenanceMap;
  capturedAt: Date;
}

export function computeConfigSnapshot(resolved: ResolvedConfig): ConfigSnapshot {
  const canonical = canonicalize({
    version: resolved.version,
    values: resolved.values,
    provenance: resolved.provenance,
  });
  const hash = createHash("sha256").update(canonical).digest("hex");

  return {
    hash,
    version: resolved.version,
    values: resolved.values,
    provenance: resolved.provenance,
    capturedAt: new Date(),
  };
}

/**
 * Deterministic JSON serialization with stably sorted object keys, so the
 * hash is independent of insertion order.
 */
function canonicalize(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}

/**
 * Only `WavesConfig`/`ProvenanceMap` shapes are ever passed in here (never
 * `ResolvedConfig.resolvedAt`, which is deliberately excluded from the
 * hashed payload above), and neither contains a `Date` field, so there is
 * no `Date`-handling branch here — it would be untestable dead code.
 */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (typeof value === "object" && value !== null) {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}
