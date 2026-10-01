import { z } from "zod";
import { providerReferenceSchema } from "../provider-reference/provider-reference.ts";

export const executionConfigSchema = z.object({
  workspaceStrategy: providerReferenceSchema.optional(),
  runtime: providerReferenceSchema.optional(),
  executor: providerReferenceSchema.optional(),
  parallelism: z
    .object({
      maxConcurrentNodes: z.number().int().positive().optional(),
    })
    .optional(),
  timeouts: z
    .object({
      nodeTimeoutMs: z.number().int().positive().optional(),
    })
    .optional(),
  costLimits: z
    .object({
      maxUsd: z.number().nonnegative().optional(),
    })
    .optional(),
});

export type ExecutionConfig = z.infer<typeof executionConfigSchema>;
