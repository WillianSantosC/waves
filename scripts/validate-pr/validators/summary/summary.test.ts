/**
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";

import { parsePrBody } from "../../core/parser";
import { PR_TEMPLATE } from "../../core/template";
import { readSharedFixture, readValidatorFixture } from "../../fixtures/read-fixture";
import { summaryValidator } from "./summary";

describe("summaryValidator", () => {
  it("passes when at least one checklist item is completed", () => {
    const parsed = parsePrBody(readSharedFixture("valid.md"));

    expect(summaryValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("passes when asterisk checklist items are completed", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "valid-summary-asterisk.md"),
    );

    expect(summaryValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("fails when summary is empty", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "invalid-summary-empty.md"),
    );
    const results = summaryValidator.validate(parsed, PR_TEMPLATE);

    expect(results).toHaveLength(1);
    expect(results[0]?.validatorId).toBe("PR006");
  });

  it("fails when no checklist item is completed", () => {
    const parsed = parsePrBody(readSharedFixture("valid-draft.md"));
    const results = summaryValidator.validate(parsed, PR_TEMPLATE);

    expect(results).toHaveLength(1);
    expect(results[0]?.message).toContain("completed checklist item");
  });
});
