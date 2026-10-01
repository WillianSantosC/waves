export interface ExecutorCapabilities {
  structuredOutput?: boolean;
  sessionResume?: boolean;
  images?: boolean;
  tools?: boolean;
  mcp?: boolean;
  workspaceEditing?: boolean;

  usageAccounting?: {
    tokens?: boolean;
    cachedTokens?: boolean;
    monetaryCost?: boolean;
  };

  contextWindow?: number;
}
