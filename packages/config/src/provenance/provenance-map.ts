import type { ConfigSource } from "./config-source.ts";

/**
 * Per-field provenance, keyed by dot-path into `WavesConfig` (e.g.
 * `"execution.parallelism.maxConcurrentNodes"`). Arrays are atomic from a
 * provenance perspective: a field holding an array gets exactly one entry,
 * not one per element.
 */
export type ProvenanceMap = Record<string, ConfigSource>;

export function setProvenance(map: ProvenanceMap, path: string, source: ConfigSource): void {
  map[path] = source;
}

export function getProvenance(map: ProvenanceMap, path: string): ConfigSource | undefined {
  return map[path];
}
