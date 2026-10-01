export type ConfigErrorCode =
  | "UNSUPPORTED_CONFIG_VERSION"
  | "INVALID_CONFIG"
  | "POLICY_VIOLATION"
  | "UNKNOWN_PROVIDER_OPTIONS"
  | "USER_CONFIG_FORBIDDEN_FIELD";

export class ConfigError extends Error {
  readonly category = "CONTRACT" as const;
  readonly code: ConfigErrorCode;
  readonly retryable: boolean;
  readonly details: unknown;

  constructor(params: {
    code: ConfigErrorCode;
    message: string;
    retryable?: boolean;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "ConfigError";
    this.code = params.code;
    this.retryable = params.retryable ?? false;
    this.details = params.details;
  }
}
