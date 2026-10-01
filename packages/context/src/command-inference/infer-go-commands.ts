import type { ProjectCommands } from "./project-commands.ts";

/**
 * `go test ./...`/`go build ./...` are stable, unambiguous Go conventions.
 * Go has no standard built-in linter/typechecker distinct from the
 * compiler, so `lint`/`typecheck` are intentionally left undefined.
 */
export function inferGoCommands(goModPath: string): ProjectCommands {
  return {
    test: { command: "go test ./...", source: { type: "go-convention", reference: goModPath } },
    build: { command: "go build ./...", source: { type: "go-convention", reference: goModPath } },
  };
}
