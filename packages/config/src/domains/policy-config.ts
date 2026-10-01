import { z } from "zod";

/**
 * Mandatory, non-bypassable project/organization policy. Unlike every
 * other `WavesConfig` domain, `policies` is never merged via the normal
 * override-wins precedence walk — see `merge-policy-config.ts`.
 */
export const policyConfigSchema = z.object({
  requireApprovalForIrreversible: z.boolean().optional(),
  maxRunCostUsd: z.number().nonnegative().optional(),
  maxNodeTimeoutMs: z.number().int().positive().optional(),
  mandatoryEvidenceGates: z.array(z.string()).optional(),
});

export type PolicyConfig = z.infer<typeof policyConfigSchema>;
