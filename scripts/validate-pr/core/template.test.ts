/**
 * @vitest-environment node
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { getSectionTitles, PR_TEMPLATE } from "./template";

const TEMPLATE_PATH = join(import.meta.dirname, "../../../.github/PULL_REQUEST_TEMPLATE.md");

function extractTemplateHeadings(content: string): string[] {
  return content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.replace(/^##\s+/, "").trim());
}

describe("PR template sync", () => {
  it("matches the official GitHub PR template section titles and order", () => {
    const templateContent = readFileSync(TEMPLATE_PATH, "utf8");
    const officialHeadings = extractTemplateHeadings(templateContent);
    const definedHeadings = getSectionTitles(PR_TEMPLATE);

    expect(definedHeadings).toEqual(officialHeadings);
  });
});
