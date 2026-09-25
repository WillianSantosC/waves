import {
  countCheckedCheckboxes,
  findSection,
  isCheckedCheckboxLine,
  normalizeBody,
  normalizeCheckedCheckboxToUnchecked,
  SUMMARY_PLACEHOLDER_PATTERN,
} from "../../core/utils";
import type {
  ParsedPrBody,
  TemplateDefinition,
  ValidationResult,
  Validator,
} from "../../core/types";

function createError(message: string, expected?: string): ValidationResult {
  return {
    id: "PR006",
    validatorId: "PR006",
    validatorName: "Summary",
    severity: "error",
    message,
    expected,
  };
}

function hasCheckedNonPlaceholderItem(body: string): boolean {
  const lines = body.split("\n").map((line) => line.trim());

  return lines.some((line) => {
    if (!isCheckedCheckboxLine(line)) {
      return false;
    }

    return !SUMMARY_PLACEHOLDER_PATTERN.test(normalizeCheckedCheckboxToUnchecked(line));
  });
}

function validateSummary(parsed: ParsedPrBody, template: TemplateDefinition): ValidationResult[] {
  const section = findSection(parsed, "summary", template);

  if (!section) {
    return [];
  }

  const body = normalizeBody(section.body);

  if (body.length === 0) {
    return [
      createError(
        "Summary must not be empty.",
        "- [x] Describe the meaningful change in this Pull Request.",
      ),
    ];
  }

  const checkedCount = countCheckedCheckboxes(section.body);

  if (checkedCount === 0 || !hasCheckedNonPlaceholderItem(section.body)) {
    return [
      createError(
        "Summary must contain at least one completed checklist item.",
        "- [x] Describe the meaningful change in this Pull Request.",
      ),
    ];
  }

  return [];
}

export const summaryValidator: Validator = {
  id: "PR006",
  name: "Summary",
  category: "content",
  modes: ["review"],
  validate: validateSummary,
};
