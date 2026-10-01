import { z } from "zod";

/**
 * Shape used for `WavesConfig` domains whose owning subsystem doesn't
 * exist as code yet (e.g. `workflows`, `evidence`). Reserves the
 * namespace without inventing a speculative shape for a subsystem that
 * has no real consumer today, per the architecture-decisions skill's
 * YAGNI guidance. `waves config explain` can report these as
 * "reserved, not yet implemented" rather than silently accepting
 * anything indefinitely.
 */
export function reservedDomainSchema() {
  return z.record(z.string(), z.unknown());
}
