import type { ApplicationCommand } from "@/commands/aplication.command.js";
import { Config } from "@/config.js";
import { Command } from "commander";
import chalk from "chalk";

function formatExample(command: string, comment?: string) {
  const bin = chalk.magenta(Config.BIN);
  const cmd = chalk.green(command);
  const prefix = chalk.gray("$");

  const annotation = comment ? " " + chalk.dim(comment) : "";

  return `${prefix} ${bin} ${cmd}${annotation}`;
}

export function commandHandler(applicationCommand: ApplicationCommand, program: Command): void {
  const description = applicationCommand.description;
  const action = applicationCommand.action;
  const name = applicationCommand.name;

  const command = new Command(name);

  let exampleText = "";

  applicationCommand.examples?.forEach(({ command, comment }) => {
    exampleText += `${formatExample(command, comment)}\n `;
  });

  applicationCommand.options?.forEach(({ name, description, alias, param }) => {
    command.option(`-${alias}, --${name}${param ? ` <${param}>` : ""}`, description);
  });

  applicationCommand.arguments?.forEach(({ name, required }) => {
    command.argument(`${required?"<":"["}${name}${required?">":"]"}`);
  });

  command.description(`${description}\n`);
  command.action(action);
  command.addHelpText("after", `${chalk.white("examples:")}\n ${exampleText}`);

  program.addCommand(command);
}
