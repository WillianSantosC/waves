import type { ProjectCommands } from "./project-commands.ts";

/**
 * `cargo test`/`cargo build` are stable, unambiguous Cargo conventions —
 * unlike JS script names, there is no competing convention to disambiguate.
 * Cargo has no standard built-in linter/typechecker distinct from the
 * compiler, so `lint`/`typecheck` are intentionally left undefined.
 */
export function inferCargoCommands(cargoTomlPath: string): ProjectCommands {
  return {
    test: { command: "cargo test", source: { type: "cargo-convention", reference: cargoTomlPath } },
    build: {
      command: "cargo build",
      source: { type: "cargo-convention", reference: cargoTomlPath },
    },
  };
}
