import { z } from "zod";

export const uiConfigSchema = z.object({
  theme: z.enum(["dark", "light", "auto"]).optional(),
  verbosity: z.enum(["quiet", "normal", "verbose"]).optional(),
});

export type UiConfig = z.infer<typeof uiConfigSchema>;
