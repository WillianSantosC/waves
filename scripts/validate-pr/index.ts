#!/usr/bin/env bun

import { readFileSync } from "node:fs";

import type { ValidationMode } from "./core/types";
import { formatResults, runValidation } from "./validate";

type CliOptions = {
  mode: ValidationMode;
  file?: string | undefined;
};

type ParsedCliOptions = Partial<CliOptions>;

function printUsage(): void {
  console.error(`Usage: bun scripts/validate-pr/index.ts --mode <template|review> [--file <path>]

Options:
  --mode, -m     Validation mode: template or review
  --file, -f     Path to a markdown file containing the PR body
  --help, -h     Show this help message

Environment:
  PR_BODY        PR description body (used when --file is not provided)
`);
}

function parseMode(value: string | undefined): ValidationMode {
  if (value === "template" || value === "review") {
    return value;
  }

  console.error('Error: --mode must be "template" or "review".');
  process.exit(1);
}

function parseFile(value: string | undefined): string {
  if (value) {
    return value;
  }

  console.error("Error: --file requires a path.");
  process.exit(1);
}

function parseOption(args: string[], index: number, options: ParsedCliOptions): number {
  const arg = args[index];

  if (arg === "--help" || arg === "-h") {
    printUsage();
    process.exit(0);
  }

  if (arg === "--mode" || arg === "-m") {
    options.mode = parseMode(args[index + 1]);
    return index + 1;
  }

  if (arg === "--file" || arg === "-f") {
    options.file = parseFile(args[index + 1]);
    return index + 1;
  }

  return index;
}

function parseArgs(args: string[]): CliOptions {
  const options: ParsedCliOptions = {};

  for (let index = 0; index < args.length; index += 1) {
    index = parseOption(args, index, options);
  }

  if (!options.mode) {
    console.error('Error: --mode is required ("template" or "review").');
    printUsage();
    process.exit(1);
  }

  return { mode: options.mode, file: options.file };
}

function readPrBody(file?: string): string {
  if (file) {
    return readFileSync(file, "utf8");
  }

  const envBody = process.env.PR_BODY;

  if (envBody !== undefined) {
    return envBody;
  }

  console.error("Error: PR body not provided. Set PR_BODY or pass --file.");
  process.exit(1);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const body = readPrBody(options.file);
  const summary = runValidation(body, options.mode);

  console.log(formatResults(summary, options.mode));

  if (summary.hasErrors) {
    process.exit(1);
  }

  process.exit(0);
}

main();
