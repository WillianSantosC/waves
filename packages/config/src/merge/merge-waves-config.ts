import type { ConfigSource } from "../provenance/config-source.ts";
import { setProvenance, type ProvenanceMap } from "../provenance/provenance-map.ts";
import type { WavesConfig } from "../waves-config/waves-config.ts";

export interface WavesConfigLayer {
  source: ConfigSource;
  config: Partial<WavesConfig>;
}

export interface MergeWavesConfigResult {
  merged: Record<string, unknown>;
  provenance: ProvenanceMap;
}

/**
 * Deterministically merges config layers lowest-to-highest authority.
 * `policies` is excluded entirely — the mandatory-policy boundary is
 * merged separately by `mergePolicyConfig` with stricter-wins semantics,
 * never by this override-wins walk.
 *
 * Merge semantics per field type:
 * - plain object: deep merge, recursing field by field
 * - array: full replacement (never spliced/combined across layers)
 * - scalar: override
 * - a key *absent* in a higher layer never overwrites a lower layer's
 *   value (or its provenance) at that path
 *
 * Returns a plain merged object (not yet validated against
 * `wavesConfigSchema` — the caller is expected to `parse()` the result)
 * plus per-path provenance, so this function stays schema-agnostic.
 */
export function mergeWavesConfig(layers: WavesConfigLayer[]): MergeWavesConfigResult {
  let merged: Record<string, unknown> = {};
  const provenance: ProvenanceMap = {};

  for (const layer of layers) {
    const { policies: _policies, ...rest } = layer.config as Record<string, unknown> & {
      policies?: unknown;
    };
    merged = deepMergeWithProvenance(merged, rest, {
      source: layer.source,
      pathPrefix: "",
      provenance,
    });
  }

  return { merged, provenance };
}

interface MergeContext {
  source: ConfigSource;
  pathPrefix: string;
  provenance: ProvenanceMap;
}

function deepMergeWithProvenance(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>,
  context: MergeContext,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };

  for (const [key, overlayValue] of Object.entries(overlay)) {
    if (overlayValue === undefined) {
      continue;
    }
    mergeField({ result, base, key, overlayValue }, context);
  }

  return result;
}

interface FieldEntry {
  result: Record<string, unknown>;
  base: Record<string, unknown>;
  key: string;
  overlayValue: unknown;
}

function mergeField({ result, base, key, overlayValue }: FieldEntry, context: MergeContext): void {
  const path = context.pathPrefix === "" ? key : `${context.pathPrefix}.${key}`;

  if (isPlainObject(overlayValue)) {
    const baseValue = base[key];
    const baseObject = isPlainObject(baseValue) ? baseValue : {};
    result[key] = deepMergeWithProvenance(baseObject, overlayValue, {
      ...context,
      pathPrefix: path,
    });
    return;
  }

  result[key] = overlayValue;
  setProvenance(context.provenance, path, context.source);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date)
  );
}
