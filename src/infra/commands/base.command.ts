import { Command } from "commander";
import config from "@/infra/config.js";
import chalk from "chalk";
import errorHandlerUtil from "@/infra/utils/errorHandler.util.js";

interface CreateBaseCommandProps {
  options?: { name: string; description: string }[];
  arguments?: string[];
  description: string;
  examples?: { command: string; comment?: string }[];
  name: string;
  action: (this: Command, ...args: any[]) => Promise<void>;
}

export class BaseCommand extends Command {
  constructor(props: CreateBaseCommandProps) {
    super(props.name);

    props.arguments?.forEach((argument) => {
      this.argument(argument);
    });

    let exampleText = "";

    props.examples?.forEach(({ command, comment }) => {
      exampleText += `${BaseCommand.formatExample(command, comment)}\n `;
    });

    this.description(`${props.description}\n ${exampleText}`);

    props.options?.forEach(({ name, description }) => {
      this.option(name, description);
    });

    this.action(errorHandlerUtil(props.action));
  }

  public static formatExample(command: string, comment?: string) {
    const bin = chalk.magenta(config.bin);
    const cmd = chalk.green(command);
    const prefix = chalk.gray("$");

    const annotation = comment ? " " + chalk.dim(comment) : "";

    return `${prefix} ${bin} ${cmd}${annotation}`;
  }
}
