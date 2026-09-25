import type { ParsedPrBody, ParsedSection, TemplateDefinition } from "./types";

const UNORDERED_LIST_MARKER = "[-*+]";
const CHECKED_CHECKBOX_LINE_PATTERN = new RegExp(`^${UNORDERED_LIST_MARKER}\\s*\\[[xX]\\]`);
const UNORDERED_BULLET_LINE_PATTERN = new RegExp(`^${UNORDERED_LIST_MARKER}\\s*(.+)$`);

export function normalizeLine(value: string): string {
  return value.trim();
}

export function normalizeBody(value: string): string {
  return value.trim();
}

export function isNaValue(value: string): boolean {
  return normalizeBody(value) === "N/A";
}

export function getNonEmptyLines(body: string): string[] {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function hasHtmlComments(content: string): boolean {
  return /<!--[\s\S]*?-->/.test(content);
}

export function stripHtmlComments(content: string): string {
  let current = content;
  let previous: string;

  do {
    previous = current;
    current = current.replace(/<!--[\s\S]*?-->/g, "");
  } while (current !== previous);

  return current.trim();
}

export function slugifySectionTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findSection(
  parsed: ParsedPrBody,
  sectionId: string,
  template: TemplateDefinition,
): ParsedSection | undefined {
  const definition = template.sections.find((section) => section.id === sectionId);

  if (!definition) {
    return undefined;
  }

  return parsed.sections.find((section) => section.title === definition.title);
}

export function parseUnorderedBulletLine(line: string): string | null {
  const match = line.trim().match(UNORDERED_BULLET_LINE_PATTERN);

  return match?.[1]?.trim() ?? null;
}

export function isUnorderedBulletLine(line: string, minContentLength = 1): boolean {
  const content = parseUnorderedBulletLine(line);

  return content !== null && content.length >= minContentLength;
}

export function isCheckedCheckboxLine(line: string): boolean {
  return CHECKED_CHECKBOX_LINE_PATTERN.test(line.trim());
}

export function normalizeCheckedCheckboxToUnchecked(line: string): string {
  return line.trim().replace(new RegExp(`^${UNORDERED_LIST_MARKER}\\s*\\[[xX]\\]\\s*`), "- [ ] ");
}

export function countCheckedCheckboxes(body: string): number {
  const matches = body.match(new RegExp(`^${UNORDERED_LIST_MARKER}\\s*\\[[xX]\\]`, "gm"));
  return matches?.length ?? 0;
}

export function countUncheckedCheckboxes(body: string): number {
  const matches = body.match(new RegExp(`^${UNORDERED_LIST_MARKER}\\s*\\[ \\]`, "gm"));
  return matches?.length ?? 0;
}

export const ISSUE_REFERENCE_PATTERN =
  /^(?:[-*+]\s*)?(Closes|Fixes|Resolves|Relates to)\s+(#\d+|\[[A-Z][A-Z0-9]*-\d+\]|[A-Z][A-Z0-9]*-\d+)$/i;

export const NUMBERED_STEP_PATTERN = /^\d+\.\s+\S/;

export const SUMMARY_PLACEHOLDER_PATTERN =
  /^-\s*\[ \]\s*<One checklist item for each meaningful change>$/i;

export const RELATED_ISSUES_PLACEHOLDER_PATTERN = /^Closes\s#$/i;

export const SUCCESS_CRITERIA_PLACEHOLDER_PATTERN = /^[-*+]$/;

export const HOW_TO_VALIDATE_PLACEHOLDER_PATTERN = /^1\.$/;
