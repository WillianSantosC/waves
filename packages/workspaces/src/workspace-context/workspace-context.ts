export interface WorkspaceContext {
  /** Absolute, normalized path to the directory the CLI was invoked from. */
  invocationDirectory: string;
  /** Absolute, normalized path to the resolved Git repository root. */
  repositoryRoot: string;
}
