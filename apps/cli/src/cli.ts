import { Command } from "commander";
import { runDoctor } from "./commands/doctor.ts";

const CLI_VERSION = "0.0.0";

export function createCli(): Command {
  const program = new Command();

  program
    .name("waves")
    .description("A cost-aware software delivery orchestrator for AI coding agents.")
    .version(CLI_VERSION);

  program
    .command("doctor")
    .description("Check that the current environment can run Waves.")
    .action(() => {
      const report = runDoctor();
      for (const line of report.lines) {
        console.log(line);
      }
      if (!report.ok) {
        process.exitCode = 1;
      }
    });

  return program;
}
