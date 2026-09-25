import {
  findSection,
  getNonEmptyLines,
  isNaValue,
  normalizeBody,
  parseUnorderedBulletLine,
  SUCCESS_CRITERIA_PLACEHOLDER_PATTERN,
} from "../../core/utils";
import type {
  ParsedPrBody,
  TemplateDefinition,
  ValidationResult,
  Validator,
} from "../../core/types";

function createError(message: string, expected?: string): ValidationResult {
  return {
    id: "PR008",
    validatorId: "PR008",
    validatorName: "Success Criteria",
    severity: "error",
    message,
    expected,
  };
}

function isMeaningfulBullet(line: string): boolean {
  const content = parseUnorderedBulletLine(line);

  if (content === null) {
    return false;
  }

  if (content.length < 3) {
    return false;
  }

  if (isNaValue(content)) {
    return false;
  }

  if (SUCCESS_CRITERIA_PLACEHOLDER_PATTERN.test(line.trim())) {
    return false;
  }

  return true;
}

function validateSuccessCriteria(
  parsed: ParsedPrBody,
  template: TemplateDefinition,
): ValidationResult[] {
  const section = findSection(parsed, "success-criteria", template);

  if (!section) {
    return [];
  }

  const body = normalizeBody(section.body);

  if (body.length === 0 || isNaValue(body)) {
    return [
      createError(
        "Success Criteria must contain at least one meaningful bullet.",
        "- Users can successfully complete the expected outcome.",
      ),
    ];
  }

  const lines = getNonEmptyLines(section.body);
  const meaningfulBullets = lines.filter(isMeaningfulBullet);

  if (meaningfulBullets.length === 0) {
    return [
      createError(
        "Success Criteria must contain at least one meaningful bullet.",
        "- Users can successfully complete the expected outcome.",
      ),
    ];
  }

  return [];
}

export const successCriteriaValidator: Validator = {
  id: "PR008",
  name: "Success Criteria",
  category: "content",
  modes: ["review"],
  validate: validateSuccessCriteria,
};
