/**
 * The seam `@waves/providers` (WV-17) will implement once a real provider
 * registry exists. `ConfigurationResolver` calls `validate` lazily, only at
 * provider-reference read sites — never eagerly for every category during
 * `resolve()`, since there is nothing to validate against yet by default.
 */
export interface ProviderOptionsValidator {
  validate(
    category: string,
    providerId: string,
    options: unknown,
  ): { ok: true } | { ok: false; errors: string[] };
}

/**
 * Default validator used until a real registry-backed validator is
 * injected: accepts any provider id/options. This is a deliberate, scoped
 * gap documented in WV-24's plan, not an oversight.
 */
export const permissiveProviderOptionsValidator: ProviderOptionsValidator = {
  validate: () => ({ ok: true }),
};
