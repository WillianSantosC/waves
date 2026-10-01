import { reservedDomainSchema } from "./reserved-domain-schema.ts";

/**
 * Reserved for the future failure/recovery engine (no owning package
 * implemented yet).
 */
export const failurePolicyConfigSchema = reservedDomainSchema();
