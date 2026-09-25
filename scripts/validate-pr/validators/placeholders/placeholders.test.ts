/**
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";

import { parsePrBody } from "../../core/parser";
import { PR_TEMPLATE } from "../../core/template";
import { readSharedFixture, readValidatorFixture } from "../../fixtures/read-fixture";
import { placeholdersValidator } from "./placeholders";

describe("placeholdersValidator", () => {
  it("passes when template placeholders were replaced", () => {
    const parsed = parsePrBody(readSharedFixture("valid.md"));

    expect(placeholdersValidator.validate(parsed, PR_TEMPLATE)).toEqual([]);
  });

  it("fails when template placeholders remain", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "invalid-placeholders.md"),
    );
    const results = placeholdersValidator.validate(parsed, PR_TEMPLATE);

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.validatorId === "PR002")).toBe(true);
  });

  it("fails when HTML instructional comments remain", () => {
    const parsed = parsePrBody(
      readValidatorFixture(import.meta.dirname, "invalid-html-comments.md"),
    );
    const results = placeholdersValidator.validate(parsed, PR_TEMPLATE);

    expect(results).toHaveLength(1);
    expect(results[0]?.message).toContain("HTML instructional comments");
  });
});
