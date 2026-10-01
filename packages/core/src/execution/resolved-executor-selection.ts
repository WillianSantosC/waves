import type { ExecutorId, ProviderId, RuntimeId } from "../identifiers/identifiers.ts";

export interface ResolvedExecutorSelection {
  executorId: ExecutorId;
  runtimeId: RuntimeId;
  providerId?: ProviderId;
}
