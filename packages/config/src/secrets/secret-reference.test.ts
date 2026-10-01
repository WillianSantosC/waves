import { describe, expect, it } from "vitest";
import { secretReferenceSchema } from "./secret-reference.ts";

describe("secretReferenceSchema", () => {
  it("accepts an env-sourced reference", () => {
    const result = secretReferenceSchema.safeParse({ source: "env", name: "WAVES_API_KEY" });
    expect(result.success).toBe(true);
  });

  it("accepts a secretRef-sourced reference", () => {
    const result = secretReferenceSchema.safeParse({
      source: "secretRef",
      ref: "vault://waves/api-key",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a bare literal secret string", () => {
    const result = secretReferenceSchema.safeParse("sk-literal-secret-value");
    expect(result.success).toBe(false);
  });

  it("rejects an object shaped like a literal value field", () => {
    const result = secretReferenceSchema.safeParse({ value: "sk-literal-secret-value" });
    expect(result.success).toBe(false);
  });
});
