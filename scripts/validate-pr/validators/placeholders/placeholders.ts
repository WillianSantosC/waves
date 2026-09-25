import { findSection } from "../../core/utils";
import type {
  ParsedPrBody,
  TemplateDefinition,
  ValidationResult,
  Validator,
} from "../../core/types";

function createError(message: string, expected?: string): ValidationResult {
  return {
    id: "PR002",
    validatorId: "PR002",
    validatorName: "Placeholders",
    severity: "error",
    message,
    expected,
  };
}

function containsPlaceholder(body: string, placeholder: string): boolean {
  const lines = body.split("\n").map((line) => line.trim());
  return lines.some((line) => line === placeholder.trim());
}

function validatePlaceholders(
  parsed: ParsedPrBody,
  template: TemplateDefinition,
): ValidationResult[] {
  const errors: ValidationResult[] = [];

  if (parsed.hasHtmlComments) {
    errors.push(
      createError(
        "HTML instructional comments must be removed before submitting the Pull Request.",
        "Remove all <!-- ... --> blocks from the PR description.",
      ),
    );
  }

  for (const sectionDefinition of template.sections) {
    const section = findSection(parsed, sectionDefinition.id, template);

    if (!section) {
      continue;
    }

    for (const placeholder of sectionDefinition.placeholders) {
      if (containsPlaceholder(section.body, placeholder)) {
        errors.push(
          createError(
            `Section "${sectionDefinition.title}" still contains the template placeholder "${placeholder}".`,
            `Replace "${placeholder}" with meaningful content.`,
          ),
        );
      }
    }
  }

  return errors;
}

export const placeholdersValidator: Validator = {
  id: "PR002",
  name: "Placeholders",
  category: "template",
  modes: ["template", "review"],
  validate: validatePlaceholders,
};
