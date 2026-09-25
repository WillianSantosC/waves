import { findSection, isNaValue, normalizeBody } from "../../core/utils";
import type {
  ParsedPrBody,
  TemplateDefinition,
  ValidationResult,
  Validator,
} from "../../core/types";

function createError(message: string, expected?: string): ValidationResult {
  return {
    id: "PR005",
    validatorId: "PR005",
    validatorName: "Additional Context",
    severity: "error",
    message,
    expected,
  };
}

function validateAdditionalContext(
  parsed: ParsedPrBody,
  template: TemplateDefinition,
): ValidationResult[] {
  const section = findSection(parsed, "additional-context", template);

  if (!section) {
    return [];
  }

  const body = normalizeBody(section.body);

  if (body.length === 0) {
    return [createError("Additional Context must contain meaningful content or N/A.", "N/A")];
  }

  if (isNaValue(body)) {
    return [];
  }

  return [];
}

export const additionalContextValidator: Validator = {
  id: "PR005",
  name: "Additional Context",
  category: "template",
  modes: ["template", "review"],
  validate: validateAdditionalContext,
};
