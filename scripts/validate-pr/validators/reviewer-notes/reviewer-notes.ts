import { findSection, isNaValue, normalizeBody } from "../../core/utils";
import type {
  ParsedPrBody,
  TemplateDefinition,
  ValidationResult,
  Validator,
} from "../../core/types";

function createError(message: string, expected?: string): ValidationResult {
  return {
    id: "PR004",
    validatorId: "PR004",
    validatorName: "Reviewer Notes",
    severity: "error",
    message,
    expected,
  };
}

function validateReviewerNotes(
  parsed: ParsedPrBody,
  template: TemplateDefinition,
): ValidationResult[] {
  const section = findSection(parsed, "reviewer-notes", template);

  if (!section) {
    return [];
  }

  const body = normalizeBody(section.body);

  if (body.length === 0) {
    return [createError("Reviewer Notes must contain meaningful content or N/A.", "N/A")];
  }

  if (isNaValue(body)) {
    return [];
  }

  return [];
}

export const reviewerNotesValidator: Validator = {
  id: "PR004",
  name: "Reviewer Notes",
  category: "template",
  modes: ["template", "review"],
  validate: validateReviewerNotes,
};
