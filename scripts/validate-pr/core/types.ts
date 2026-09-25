export type Category = "structure" | "template" | "content";

export type Severity = "error" | "warning";

export type ValidationMode = "template" | "review";

export type ParsedSection = {
  id: string;
  title: string;
  body: string;
  raw: string;
};

export type ParsedPrBody = {
  sections: ParsedSection[];
  hasHtmlComments: boolean;
  raw: string;
};

export type TemplateSectionDefinition = {
  id: string;
  title: string;
  placeholders: string[];
  optionalNaAllowed?: boolean;
};

export type TemplateDefinition = {
  sections: TemplateSectionDefinition[];
};

export type ValidationResult = {
  id: string;
  validatorId: string;
  validatorName: string;
  severity: Severity;
  message: string;
  expected?: string | undefined;
};

export type Validator = {
  id: string;
  name: string;
  category: Category;
  modes: ValidationMode[];
  validate: (parsed: ParsedPrBody, template: TemplateDefinition) => ValidationResult[];
};

export type ValidationSummary = {
  results: ValidationResult[];
  passed: ValidationResult[];
  failed: ValidationResult[];
  hasErrors: boolean;
};
