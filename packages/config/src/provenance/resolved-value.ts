import type { ConfigSource } from "./config-source.ts";

/**
 * A resolved configuration value paired with the source that produced it.
 */
export interface ResolvedValue<T> {
  value: T;
  source: ConfigSource;
}
