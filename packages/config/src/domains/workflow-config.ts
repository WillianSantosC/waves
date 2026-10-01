import { reservedDomainSchema } from "./reserved-domain-schema.ts";

/**
 * Reserved for the future workflow engine (`@waves/workflow`, stub-only
 * today), keyed by workflow id once implemented.
 */
export const workflowConfigSchema = reservedDomainSchema();
