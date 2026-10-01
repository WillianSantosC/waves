import { z } from "zod";

/**
 * Where a resolved configuration value came from. `environment` and
 * `discovered` tag values folded into another layer (e.g. a project-layer
 * field populated from an env var or from deterministic project discovery)
 * rather than denoting separate ordered precedence layers.
 */
export const configSourceKindSchema = z.enum([
  "builtin",
  "user",
  "project",
  "profile",
  "workflow",
  "node",
  "environment",
  "cli",
  "discovered",
]);

export type ConfigSourceKind = z.infer<typeof configSourceKindSchema>;

export const configSourceSchema = z.object({
  kind: configSourceKindSchema,
  reference: z.string().optional(),
});

export type ConfigSource = z.infer<typeof configSourceSchema>;
