import { countCheckedCheckboxes, findSection } from "../../core/utils";
import type {
  ParsedPrBody,
  TemplateDefinition,
  ValidationResult,
  Validator,
} from "../../core/types";

function createError(message: string, expected?: string): ValidationResult {
  return {
    id: "PR003",
    validatorId: "PR003",
    validatorName: "Type of Change",
    severity: "error",
    message,
    expected,
  };
}

function validateTypeOfChange(
  parsed: ParsedPrBody,
  template: TemplateDefinition,
): ValidationResult[] {
  const section = findSection(parsed, "type-of-change", template);

  if (!section) {
    return [];
  }

  const checkedCount = countCheckedCheckboxes(section.body);

  if (checkedCount === 0) {
    return [
      createError('Exactly one "Type of Change" checkbox must be selected.', "- [x] ✨ Feature"),
    ];
  }

  if (checkedCount > 1) {
    return [createError('Only one "Type of Change" checkbox may be selected.', "- [x] ✨ Feature")];
  }

  return [];
}

export const typeOfChangeValidator: Validator = {
  id: "PR003",
  name: "Type of Change",
  category: "template",
  modes: ["template", "review"],
  validate: validateTypeOfChange,
};
