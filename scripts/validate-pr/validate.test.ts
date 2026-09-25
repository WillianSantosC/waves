/**
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";

import { readSharedFixture } from "./fixtures/read-fixture";
import { getValidatorsForMode, runValidation } from "./validate";
import { allValidators } from "./validators";

describe("runValidation", () => {
  it("passes template mode for draft-ready PR bodies", () => {
    const summary = runValidation(readSharedFixture("valid-draft.md"), "template");

    expect(summary.hasErrors).toBe(false);
  });

  it("fails review mode when summary is incomplete", () => {
    const summary = runValidation(readSharedFixture("valid-draft.md"), "review");

    expect(summary.hasErrors).toBe(true);
    expect(summary.failed.some((result) => result.validatorId === "PR006")).toBe(true);
  });

  it("passes review mode for fully completed PR bodies", () => {
    const summary = runValidation(readSharedFixture("valid.md"), "review");

    expect(summary.hasErrors).toBe(false);
  });

  it("runs only template validators in template mode", () => {
    const activeValidators = getValidatorsForMode("template", allValidators);

    expect(activeValidators.map((validator) => validator.id)).toEqual([
      "PR001",
      "PR002",
      "PR003",
      "PR004",
      "PR005",
    ]);
  });

  it("runs all validators in review mode", () => {
    const activeValidators = getValidatorsForMode("review", allValidators);

    expect(activeValidators.map((validator) => validator.id)).toEqual([
      "PR001",
      "PR002",
      "PR003",
      "PR004",
      "PR005",
      "PR006",
      "PR007",
      "PR008",
      "PR009",
    ]);
  });
});
