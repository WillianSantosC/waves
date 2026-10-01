import type { ConfigSource } from "../provenance/config-source.ts";

/**
 * The explanation surface `waves config explain [path]` renders. With no
 * `path`, `entries` covers every resolved field; with a `path`, it is
 * narrowed to that field and its descendants.
 */
export interface ConfigurationExplanation {
  entries: { path: string; value: unknown; source: ConfigSource }[];
}
