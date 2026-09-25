/**
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";

import { parsePrBody } from "../../core/parser";
import { PR_TEMPLATE } from "../../core/template";
import { readSharedFixture, readValidatorFixture } from "../../fixtures/read-fixture";
import { howToValidateValidator } from "./how-to-validate";

describe("howToValidateValidator", () => {
  it("passes for numbered validation steps", () => {
    const parsed = parsePrBody(readSharedFixture("valid.md"));

    expect(howToValidateValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("fails when N/A is used", () => {
    const parsed = parsePrBody(readSharedFixture("valid-draft.md"));
    const results = howToValidateValidator.validate(parsed, PR_TEMPLATE);

    expect(results).toHaveLength(1);
    expect(results[0]?.validatorId).toBe("PR009");
    expect(results[0]?.message).toContain("numbered validation step");
  });

  it("fails when free-form text is used instead of numbered steps", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "invalid-how-to-validate.md"),
    );
    const results = howToValidateValidator.validate(parsed, PR_TEMPLATE);

    expect(results).toHaveLength(1);
    expect(results[0]?.validatorId).toBe("PR009");
  });
});
