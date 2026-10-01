import { z } from "zod";

export const approvalConfigSchema = z.object({
  autonomy: z.enum(["manual", "supervised", "autonomous"]).optional(),
  defaultMode: z.enum(["approval", "input"]).optional(),
});

export type ApprovalConfig = z.infer<typeof approvalConfigSchema>;
