/**
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";

import { parsePrBody } from "../../core/parser";
import { PR_TEMPLATE } from "../../core/template";
import { readSharedFixture, readValidatorFixture } from "../../fixtures/read-fixture";
import { successCriteriaValidator } from "./success-criteria";

describe("successCriteriaValidator", () => {
  it("passes when meaningful bullets are present", () => {
    const parsed = parsePrBody(readSharedFixture("valid.md"));

    expect(successCriteriaValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("passes when asterisk bullets are used", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "valid-success-criteria-asterisk.md"),
    );

    expect(successCriteriaValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("fails when N/A is used", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "invalid-success-criteria.md"),
    );
    const results = successCriteriaValidator.validate(parsed, PR_TEMPLATE);

    expect(results).toHaveLength(1);
    expect(results[0]?.validatorId).toBe("PR008");
  });
});
