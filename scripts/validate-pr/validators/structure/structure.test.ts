/**
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";

import { parsePrBody } from "../../core/parser";
import { PR_TEMPLATE } from "../../core/template";
import { readSharedFixture, readValidatorFixture } from "../../fixtures/read-fixture";
import { structureValidator } from "./structure";

describe("structureValidator", () => {
  it("passes when sections match the official template", () => {
    const parsed = parsePrBody(readSharedFixture("valid.md"));

    expect(structureValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("fails when sections are out of order", () => {
    const parsed = parsePrBody(readValidatorFixture(import.meta.dirname, "invalid-order.md"));
    const results = structureValidator.validate(parsed, PR_TEMPLATE);

    expect(results).toHaveLength(1);
    expect(results[0]?.validatorId).toBe("PR001");
    expect(results[0]?.message).toContain("out of order");
  });

  it("fails when unexpected sections are present", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "invalid-extra-section.md"),
    );
    const results = structureValidator.validate(parsed, PR_TEMPLATE);

    expect(results).toHaveLength(1);
    expect(results[0]?.validatorId).toBe("PR001");
    expect(results[0]?.message).toContain("Unexpected section");
  });

  it("fails when required sections are missing", () => {
    const parsed = parsePrBody("## Summary\nA summary without the remaining template sections.");
    const results = structureValidator.validate(parsed, PR_TEMPLATE);

    expect(results).toHaveLength(1);
    expect(results[0]?.validatorId).toBe("PR001");
    expect(results[0]?.message).toContain("Missing required section");
  });
});
