import { describe, expect, it } from "vitest";
import { providerReferenceSchema } from "./provider-reference.ts";

describe("providerReferenceSchema", () => {
  it("accepts a minimal reference", () => {
    expect(providerReferenceSchema.safeParse({ provider: "claude" }).success).toBe(true);
  });

  it("accepts an unknown provider id and arbitrary options (deferred to WV-17)", () => {
    const result = providerReferenceSchema.safeParse({
      provider: "some-not-yet-registered-provider",
      required: true,
      options: { anything: ["goes", "here"] },
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty provider id", () => {
    expect(providerReferenceSchema.safeParse({ provider: "" }).success).toBe(false);
  });

  it("rejects a missing provider id", () => {
    expect(providerReferenceSchema.safeParse({ options: {} }).success).toBe(false);
  });
});
