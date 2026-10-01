import { reservedDomainSchema } from "./reserved-domain-schema.ts";

/**
 * Reserved for the future evidence/gates engine (`@waves/evidence`,
 * stub-only today).
 */
export const evidenceConfigSchema = reservedDomainSchema();
