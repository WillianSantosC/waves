import type { ProviderId } from "../identifiers/identifiers.ts";

export interface ExecutorSessionReference {
  provider: ProviderId;
  opaqueId: string;
  metadata?: Record<string, unknown>;
}
