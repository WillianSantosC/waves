import { z } from "zod";
import { agentConfigSchema } from "../domains/agent-config.ts";
import { approvalConfigSchema } from "../domains/approval-config.ts";
import { commandsConfigSchema } from "../domains/commands-config.ts";
import { contextConfigSchema } from "../domains/context-config.ts";
import { evidenceConfigSchema } from "../domains/evidence-config.ts";
import { executionConfigSchema } from "../domains/execution-config.ts";
import { failurePolicyConfigSchema } from "../domains/failure-policy-config.ts";
import { integrationConfigSchema } from "../domains/integration-config.ts";
import { memoryConfigSchema } from "../domains/memory-config.ts";
import { observabilityConfigSchema } from "../domains/observability-config.ts";
import { policyConfigSchema } from "../domains/policy-config.ts";
import { projectConfigSchema } from "../domains/project-config.ts";
import { recoveryPolicyConfigSchema } from "../domains/recovery-policy-config.ts";
import { uiConfigSchema } from "../domains/ui-config.ts";
import { workflowConfigSchema } from "../domains/workflow-config.ts";

/**
 * Composed top-level `WavesConfig` schema, matching the field list in
 * `docs/contracts/core-contracts-v0.1.md` §4. Every field is optional
 * except `version`: a raw document containing nothing but a version
 * number is valid and resolves entirely through defaults.
 */
export const wavesConfigSchema = z.object({
  version: z.number().int(),
  project: projectConfigSchema.optional(),
  commands: commandsConfigSchema.optional(),
  context: contextConfigSchema.optional(),
  agents: agentConfigSchema.optional(),
  workflows: workflowConfigSchema.optional(),
  execution: executionConfigSchema.optional(),
  approvals: approvalConfigSchema.optional(),
  policies: policyConfigSchema.optional(),
  failure: failurePolicyConfigSchema.optional(),
  recovery: recoveryPolicyConfigSchema.optional(),
  evidence: evidenceConfigSchema.optional(),
  memory: memoryConfigSchema.optional(),
  observability: observabilityConfigSchema.optional(),
  integrations: integrationConfigSchema.optional(),
  ui: uiConfigSchema.optional(),
});

export type WavesConfig = z.infer<typeof wavesConfigSchema>;
