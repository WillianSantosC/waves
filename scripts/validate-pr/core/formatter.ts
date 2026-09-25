import type { ValidationResult, ValidationSummary, Validator } from "./types";

const DIVIDER = "──────────────────────────────────────";

function formatValidatorLine(validator: Validator, results: ValidationResult[]): string {
  const failed = results.some(
    (result) => result.validatorId === validator.id && result.severity === "error",
  );

  const symbol = failed ? "✗" : "✓";
  return `${symbol} ${validator.name} (${validator.id})`;
}

function formatFailureDetails(results: ValidationResult[]): string[] {
  const lines: string[] = [];

  for (const result of results) {
    lines.push(`✗ ${result.validatorName} (${result.validatorId})`);
    lines.push("");
    lines.push(result.message);

    if (result.expected) {
      lines.push("");
      lines.push("Expected:");
      lines.push("");
      lines.push(result.expected);
    }

    lines.push("");
    lines.push(DIVIDER);
  }

  return lines;
}

export function formatValidationOutput(
  summary: ValidationSummary,
  validators: Validator[],
): string {
  const lines: string[] = [];

  if (summary.hasErrors) {
    lines.push("❌ Pull Request Compliance Failed");
  } else {
    lines.push("✅ Pull Request Compliance Passed");
  }

  lines.push("");
  lines.push(DIVIDER);
  lines.push("");

  for (const validator of validators) {
    lines.push(formatValidatorLine(validator, summary.results));
  }

  if (summary.failed.length > 0) {
    lines.push("");
    lines.push(DIVIDER);
    lines.push("");
    lines.push(...formatFailureDetails(summary.failed));
  }

  return lines.join("\n").trimEnd();
}
