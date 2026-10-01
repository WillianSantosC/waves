export interface OutputContract {
  format: "text" | "json" | "structured";
  schema?: unknown;

  requiredMemoryKeys?: string[];
  requiredArtifacts?: string[];
  humanReview?: boolean;
}
