import { z } from "zod";
import { providerReferenceSchema } from "../provider-reference/provider-reference.ts";

/**
 * Named provider slots (e.g. `taskSource`, `review`, `delivery`) without
 * any concrete vendor (Linear/GitHub/etc.) leaking into core config.
 */
export const integrationConfigSchema = z.record(z.string(), providerReferenceSchema);

export type IntegrationConfig = z.infer<typeof integrationConfigSchema>;
