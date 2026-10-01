import { z } from "zod";
import { providerReferenceSchema } from "../provider-reference/provider-reference.ts";

export const observabilityConfigSchema = z.object({
  telemetry: providerReferenceSchema.optional(),
});

export type ObservabilityConfig = z.infer<typeof observabilityConfigSchema>;
