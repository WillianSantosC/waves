import {
  findSection,
  getNonEmptyLines,
  isNaValue,
  ISSUE_REFERENCE_PATTERN,
  normalizeBody,
  RELATED_ISSUES_PLACEHOLDER_PATTERN,
} from "../../core/utils";
import type {
  ParsedPrBody,
  TemplateDefinition,
  ValidationResult,
  Validator,
} from "../../core/types";

const EXPECTED_FORMAT =
  "Closes #123\nCloses PER-10\nCloses [WV-1]\nFixes ABC-123\nResolves #456\nRelates to ENG-42\n\nor\n\nN/A";

function createError(message: string, expected: string = EXPECTED_FORMAT): ValidationResult {
  return {
    id: "PR007",
    validatorId: "PR007",
    validatorName: "Related Issues",
    severity: "error",
    message,
    expected,
  };
}

function validateRelatedIssues(
  parsed: ParsedPrBody,
  template: TemplateDefinition,
): ValidationResult[] {
  const section = findSection(parsed, "related-issues", template);

  if (!section) {
    return [];
  }

  const body = normalizeBody(section.body);

  if (body.length === 0) {
    return [createError("Related Issues must reference a valid issue or N/A.")];
  }

  if (isNaValue(body)) {
    return [];
  }

  const lines = getNonEmptyLines(section.body);

  if (lines.some((line) => isNaValue(line))) {
    return [createError("Related Issues cannot mix N/A with issue references.")];
  }

  const invalidLines = lines.filter(
    (line) => !ISSUE_REFERENCE_PATTERN.test(line) && !RELATED_ISSUES_PLACEHOLDER_PATTERN.test(line),
  );

  if (invalidLines.length > 0) {
    return [createError(`Invalid Related Issues format: "${invalidLines[0]}".`)];
  }

  const placeholderLines = lines.filter((line) => RELATED_ISSUES_PLACEHOLDER_PATTERN.test(line));

  if (placeholderLines.length > 0) {
    return [
      createError(
        'Related Issues placeholder "Closes #" must be replaced with a complete issue reference or N/A.',
      ),
    ];
  }

  if (lines.length === 0) {
    return [createError("Related Issues must reference a valid issue or N/A.")];
  }

  return [];
}

export const relatedIssuesValidator: Validator = {
  id: "PR007",
  name: "Related Issues",
  category: "content",
  modes: ["review"],
  validate: validateRelatedIssues,
};
