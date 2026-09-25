/**
 * @vitest-environment node
 */

import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { readSharedFixture, readValidatorFixture } from "../fixtures/read-fixture";
import { parsePrBody } from "./parser";

const PLACEHOLDERS_DIR = join(import.meta.dirname, "../validators/placeholders");

describe("parsePrBody", () => {
  it("parses all template sections in order", () => {
    const parsed = parsePrBody(readSharedFixture("valid.md"));

    expect(parsed.sections).toHaveLength(7);
    expect(parsed.sections.map((section) => section.title)).toEqual([
      "Summary",
      "Type of Change",
      "Related Issues",
      "Success Criteria",
      "How to Validate",
      "Reviewer Notes",
      "Additional Context",
    ]);
  });

  it("detects HTML comments in the PR body", () => {
    const parsed = parsePrBody(readValidatorFixture(PLACEHOLDERS_DIR, "invalid-html-comments.md"));

    expect(parsed.hasHtmlComments).toBe(true);
  });

  it("returns no sections when headings are missing", () => {
    const parsed = parsePrBody("No headings here");

    expect(parsed.sections).toEqual([]);
  });
});
