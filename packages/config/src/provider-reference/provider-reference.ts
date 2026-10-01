import { z } from "zod";

/**
 * A reference to a provider by id, with provider-specific options opaque
 * to this package. Shape validation only (`provider` is a non-empty
 * string) happens here; validating `options` against the selected
 * provider's own schema is the responsibility of whatever
 * `ProviderOptionsValidator` is injected into the resolver (see
 * `provider-options-validator.ts`) — this package has no provider
 * registry to validate against.
 */
export const providerReferenceSchema = z.object({
  provider: z.string().min(1),
  required: z.boolean().optional(),
  options: z.unknown().optional(),
});

export type ProviderReference<TOptions = unknown> = {
  provider: string;
  required?: boolean;
  options?: TOptions;
};
