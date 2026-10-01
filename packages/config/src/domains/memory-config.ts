import { z } from "zod";
import { providerReferenceSchema } from "../provider-reference/provider-reference.ts";

/**
 * Project Memory provider selection and Agent Handoff configuration only.
 * Workflow Memory is Waves-owned and has no external provider selector,
 * so it intentionally has no field here.
 */
export const memoryConfigSchema = z.object({
  projectMemory: providerReferenceSchema.optional(),
  agentHandoff: z
    .object({
      provider: providerReferenceSchema.optional(),
    })
    .optional(),
});

export type MemoryConfig = z.infer<typeof memoryConfigSchema>;
