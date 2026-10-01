export interface AgentUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cachedInputTokens?: number;

  estimatedCost?: Money;
  usageSource?: "provider" | "waves-estimate" | "unknown";
}

export interface Money {
  amount: number;
  currency: string;
  estimationSource?: string;
}
