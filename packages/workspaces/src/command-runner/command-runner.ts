import { execFile, type ExecException } from "node:child_process";

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  /**
   * Set when the process never ran (e.g. the executable was not found, the
   * `cwd` did not exist, or a permission error occurred), holding Node's
   * spawn error code (e.g. "ENOENT"). Callers must not interpret `exitCode`
   * as a real process exit code when this is set.
   */
  spawnError: string | undefined;
}

export interface RunCommandOptions {
  cwd: string;
}

export function runCommand(
  command: string,
  args: string[],
  options: RunCommandOptions,
): Promise<CommandResult> {
  return new Promise((resolve) => {
    execFile(command, args, { cwd: options.cwd }, (error, stdout, stderr) => {
      const spawnError = error && typeof error.code === "string" ? error.code : undefined;
      const exitCode = resolveExitCode(error);

      resolve({
        exitCode,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        spawnError,
      });
    });
  });
}

function resolveExitCode(error: ExecException | null): number {
  if (error === null) {
    return 0;
  }

  return typeof error.code === "number" ? error.code : 1;
}
