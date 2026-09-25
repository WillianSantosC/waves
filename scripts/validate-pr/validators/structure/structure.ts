import { getSectionTitles } from "../../core/template";
import type {
  ParsedPrBody,
  TemplateDefinition,
  ValidationResult,
  Validator,
} from "../../core/types";

function createError(message: string, expected?: string): ValidationResult {
  return {
    id: "PR001",
    validatorId: "PR001",
    validatorName: "Structure",
    severity: "error",
    message,
    expected,
  };
}

function formatExpectedTitles(titles: string[]): string {
  return titles.map((title) => `## ${title}`).join("\n");
}

function validateSectionCount(
  actualTitles: string[],
  expectedTitles: string[],
): ValidationResult | undefined {
  if (actualTitles.length === expectedTitles.length) {
    return undefined;
  }

  const expected = formatExpectedTitles(expectedTitles);
  const extraTitles = actualTitles.filter((title) => !expectedTitles.includes(title));

  if (extraTitles.length > 0) {
    return createError(`Unexpected section(s) found: ${extraTitles.join(", ")}.`, expected);
  }

  const missingTitles = expectedTitles.filter((title) => !actualTitles.includes(title));

  if (missingTitles.length > 0) {
    return createError(`Missing required section(s): ${missingTitles.join(", ")}.`, expected);
  }

  return undefined;
}

function validateSectionOrder(
  actualTitles: string[],
  expectedTitles: string[],
): ValidationResult | undefined {
  const expected = formatExpectedTitles(expectedTitles);

  for (let index = 0; index < expectedTitles.length; index += 1) {
    const expectedTitle = expectedTitles[index];
    const actualTitle = actualTitles[index];

    if (actualTitle !== expectedTitle) {
      return createError(
        `Sections are out of order. Expected "${expectedTitle}" at position ${index + 1}, found "${actualTitle ?? "nothing"}".`,
        expected,
      );
    }
  }

  return undefined;
}

function validateStructure(parsed: ParsedPrBody, template: TemplateDefinition): ValidationResult[] {
  const expectedTitles = getSectionTitles(template);
  const actualTitles = parsed.sections.map((section) => section.title);

  if (parsed.sections.length === 0) {
    return [
      createError(
        "Pull Request body is missing required template sections.",
        formatExpectedTitles(expectedTitles),
      ),
    ];
  }

  const countError = validateSectionCount(actualTitles, expectedTitles);

  if (countError) {
    return [countError];
  }

  const orderError = validateSectionOrder(actualTitles, expectedTitles);
  return orderError ? [orderError] : [];
}

export const structureValidator: Validator = {
  id: "PR001",
  name: "Structure",
  category: "structure",
  modes: ["template", "review"],
  validate: validateStructure,
};
