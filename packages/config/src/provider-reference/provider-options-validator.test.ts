import { describe, expect, it } from "vitest";
import {
  permissiveProviderOptionsValidator,
  type ProviderOptionsValidator,
} from "./provider-options-validator.ts";

describe("permissiveProviderOptionsValidator", () => {
  it("always accepts, regardless of category/provider/options", () => {
    expect(permissiveProviderOptionsValidator.validate("executor", "unknown-provider", {})).toEqual(
      { ok: true },
    );
  });
});

describe("ProviderOptionsValidator seam", () => {
  it("can be implemented with a strict validator rejecting unknown provider ids", () => {
    const strictValidator: ProviderOptionsValidator = {
      validate: (_category, providerId) =>
        providerId === "claude"
          ? { ok: true }
          : { ok: false, errors: [`unknown provider: ${providerId}`] },
    };

    expect(strictValidator.validate("executor", "claude", {})).toEqual({ ok: true });
    expect(strictValidator.validate("executor", "ghost", {})).toEqual({
      ok: false,
      errors: ["unknown provider: ghost"],
    });
  });
});
