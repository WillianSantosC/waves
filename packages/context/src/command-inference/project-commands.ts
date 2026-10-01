export interface DiscoverySource {
  type: string;
  reference: string;
}

export interface DiscoveredCommand {
  command: string;
  source: DiscoverySource;
}

export interface ProjectCommands {
  test?: DiscoveredCommand;
  lint?: DiscoveredCommand;
  typecheck?: DiscoveredCommand;
  build?: DiscoveredCommand;
}
