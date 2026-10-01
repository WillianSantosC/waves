import { z } from "zod";

const projectCommandSchema = z.object({
  command: z.string().min(1),
});

/**
 * User/project-declared overrides for discovered project commands. This
 * intentionally does not import `ProjectCommands` from `@waves/context`:
 * that type is a discovery *output* shape, while this is config *input* —
 * importing it would invert the dependency direction (config would depend
 * on discovery, when discovery should instead feed config defaults from
 * the outside).
 */
export const commandsConfigSchema = z.object({
  test: projectCommandSchema.optional(),
  lint: projectCommandSchema.optional(),
  typecheck: projectCommandSchema.optional(),
  build: projectCommandSchema.optional(),
});

export type CommandsConfig = z.infer<typeof commandsConfigSchema>;
