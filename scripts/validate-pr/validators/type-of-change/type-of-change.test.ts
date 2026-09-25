/**
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";

import { parsePrBody } from "../../core/parser";
import { PR_TEMPLATE } from "../../core/template";
import { readSharedFixture, readValidatorFixture } from "../../fixtures/read-fixture";
import { typeOfChangeValidator } from "./type-of-change";

describe("typeOfChangeValidator", () => {
  it("passes when exactly one checkbox is selected", () => {
    const parsed = parsePrBody(readSharedFixture("valid.md"));

    expect(typeOfChangeValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("passes when exactly one asterisk checkbox is selected", () => {
    const parsed = parsePrBody(readValidatorFixture(import.meta.dirname, "valid-type-asterisk.md"));

    expect(typeOfChangeValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("fails when no checkbox is selected", () => {
    const parsed = parsePrBody(readValidatorFixture(import.meta.dirname, "invalid-type-none.md"));
    const results = typeOfChangeValidator.validate(parsed, PR_TEMPLATE);

    expect(results).toHaveLength(1);
    expect(results[0]?.validatorId).toBe("PR003");
  });

  it("fails when multiple checkboxes are selected", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "invalid-type-multiple.md"),
    );
    const results = typeOfChangeValidator.validate(parsed, PR_TEMPLATE);

    expect(results).toHaveLength(1);
    expect(results[0]?.message).toContain("Only one");
  });

  it("fails when multiple asterisk checkboxes are selected", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "invalid-type-multiple-asterisk.md"),
    );
    const results = typeOfChangeValidator.validate(parsed, PR_TEMPLATE);

    expect(results).toHaveLength(1);
    expect(results[0]?.message).toContain("Only one");
  });
});
