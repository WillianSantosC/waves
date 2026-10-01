export interface ConfigurationValidationError {
  path: string;
  message: string;
}

export type ConfigurationValidationResult =
  | { valid: true }
  | { valid: false; errors: ConfigurationValidationError[] };
