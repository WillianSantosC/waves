import { z } from "zod";

/**
 * A reference to a credential/secret value, never the value itself. There
 * is intentionally no literal-string variant in this union: wherever a
 * credential-shaped field exists in a config schema, it uses
 * `secretReferenceSchema`, so a literal secret string fails Zod validation
 * instead of silently being accepted and serialized into committed config.
 */
export const secretReferenceSchema = z.discriminatedUnion("source", [
  z.object({ source: z.literal("env"), name: z.string().min(1) }),
  z.object({ source: z.literal("secretRef"), ref: z.string().min(1) }),
]);

export type SecretReference = z.infer<typeof secretReferenceSchema>;
