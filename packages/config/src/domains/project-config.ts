import { z } from "zod";

export const projectConfigSchema = z.object({
  name: z.string().optional(),
  storageDir: z.string().optional(),
});

export type ProjectConfig = z.infer<typeof projectConfigSchema>;
