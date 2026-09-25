import {
  findSection,
  getNonEmptyLines,
  HOW_TO_VALIDATE_PLACEHOLDER_PATTERN,
  isNaValue,
  normalizeBody,
  NUMBERED_STEP_PATTERN,
} from "../../core/utils";
import type {
  ParsedPrBody,
  TemplateDefinition,
  ValidationResult,
  Validator,
} from "../../core/types";

function createError(message: string, expected?: string): ValidationResult {
  return {
    id: "PR009",
    validatorId: "PR009",
    validatorName: "How to Validate",
    severity: "error",
    message,
    expected,
  };
}

function hasValidNumberedSteps(body: string): boolean {
  const lines = getNonEmptyLines(body);

  return lines.some((line) => {
    if (HOW_TO_VALIDATE_PLACEHOLDER_PATTERN.test(line)) {
      return false;
    }

    return NUMBERED_STEP_PATTERN.test(line);
  });
}

function validateHowToValidate(
  parsed: ParsedPrBody,
  template: TemplateDefinition,
): ValidationResult[] {
  const section = findSection(parsed, "how-to-validate", template);

  if (!section) {
    return [];
  }

  const body = normalizeBody(section.body);

  if (body.length === 0 || isNaValue(body)) {
    return [
      createError(
        "How to Validate must contain at least one numbered validation step.",
        "1. Run `bun dev`\n2. Verify the expected behavior",
      ),
    ];
  }

  if (!hasValidNumberedSteps(section.body)) {
    return [
      createError(
        "How to Validate must contain at least one numbered validation step.",
        "1. Run `bun dev`\n2. Verify the expected behavior",
      ),
    ];
  }

  return [];
}

export const howToValidateValidator: Validator = {
  id: "PR009",
  name: "How to Validate",
  category: "content",
  modes: ["review"],
  validate: validateHowToValidate,
};
