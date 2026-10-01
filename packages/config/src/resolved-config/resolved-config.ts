import type { ProvenanceMap } from "../provenance/provenance-map.ts";
import type { WavesConfig } from "../waves-config/waves-config.ts";
import type { PolicySnapshot } from "./policy-snapshot.ts";

export interface ResolvedConfig {
  version: number;
  values: WavesConfig;
  provenance: ProvenanceMap;
  policySnapshot: PolicySnapshot;
  resolvedAt: Date;
}
