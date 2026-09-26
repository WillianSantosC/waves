/**
 * Mirrors the `ExecutionError` shape from docs/contracts/core-contracts-v0.1.md
 * (§66) so downstream consumers can handle it consistently. Only the
 * "OPERATIONAL" category is needed here; the full `FailureCategory` union
 * is not yet defined in code, so it is not imported speculatively.
 */
export class WorkspaceResolutionError extends Error {
  readonly category = "OPERATIONAL" as const;
  readonly code: string;
  readonly retryable: boolean | undefined;
  readonly details: unknown;

  constructor(params: { code: string; message: string; retryable?: boolean; details?: unknown }) {
    super(params.message);
    this.name = "WorkspaceResolutionError";
    this.code = params.code;
    this.retryable = params.retryable;
    this.details = params.details;
  }
}
