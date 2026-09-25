/**
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";

import { parsePrBody } from "../../core/parser";
import { PR_TEMPLATE } from "../../core/template";
import { readSharedFixture, readValidatorFixture } from "../../fixtures/read-fixture";
import { relatedIssuesValidator } from "./related-issues";

describe("relatedIssuesValidator", () => {
  it("passes for GitHub issue references", () => {
    const parsed = parsePrBody(readSharedFixture("valid.md"));

    expect(relatedIssuesValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("passes for Linear-style issue references", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "valid-related-issues-linear.md"),
    );

    expect(relatedIssuesValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("passes for mixed GitHub and cross-platform references", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "valid-related-issues-mixed.md"),
    );

    expect(relatedIssuesValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("passes for asterisk-prefixed issue references", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "valid-related-issues-asterisk.md"),
    );

    expect(relatedIssuesValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("passes when N/A is used", () => {
    const parsed = parsePrBody(readSharedFixture("valid-draft.md"));

    expect(relatedIssuesValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("fails for invalid formats", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "invalid-related-issues.md"),
    );
    const results = relatedIssuesValidator.validate(parsed, PR_TEMPLATE);

    expect(results).toHaveLength(1);
    expect(results[0]?.validatorId).toBe("PR007");
  });
});
