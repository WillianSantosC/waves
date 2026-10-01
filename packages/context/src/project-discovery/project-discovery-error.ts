export class ProjectDiscoveryError extends Error {
  readonly category = "OPERATIONAL" as const;
  readonly code: string;
  readonly retryable: boolean | undefined;
  readonly details: unknown;

  constructor(params: { code: string; message: string; retryable?: boolean; details?: unknown }) {
    super(params.message);
    this.name = "ProjectDiscoveryError";
    this.code = params.code;
    this.retryable = params.retryable;
    this.details = params.details;
  }
}
