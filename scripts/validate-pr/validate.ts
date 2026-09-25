import { formatValidationOutput } from "./core/formatter";
import { parsePrBody } from "./core/parser";
import { PR_TEMPLATE } from "./core/template";
import type { ValidationMode, ValidationResult, ValidationSummary, Validator } from "./core/types";
import { allValidators } from "./validators";

export function getValidatorsForMode(
  mode: ValidationMode,
  validators: Validator[] = allValidators,
): Validator[] {
  return validators.filter((validator) => validator.modes.includes(mode));
}

export function runValidation(
  body: string,
  mode: ValidationMode,
  validators: Validator[] = allValidators,
): ValidationSummary {
  const parsed = parsePrBody(body);
  const activeValidators = getValidatorsForMode(mode, validators);
  const results: ValidationResult[] = [];

  for (const validator of activeValidators) {
    results.push(...validator.validate(parsed, PR_TEMPLATE));
  }

  const failed = results.filter((result) => result.severity === "error");
  const passed = results.filter((result) => result.severity !== "error");

  return {
    results,
    passed,
    failed,
    hasErrors: failed.length > 0,
  };
}

export function formatResults(
  summary: ValidationSummary,
  mode: ValidationMode,
  validators: Validator[] = allValidators,
): string {
  const activeValidators = getValidatorsForMode(mode, validators);
  return formatValidationOutput(summary, activeValidators);
}
