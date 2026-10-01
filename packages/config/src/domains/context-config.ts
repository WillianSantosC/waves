import { reservedDomainSchema } from "./reserved-domain-schema.ts";

/**
 * Reserved for the future Context Projection/budget engine (`@waves/context`
 * projection work, not yet implemented beyond deterministic discovery).
 */
export const contextConfigSchema = reservedDomainSchema();
