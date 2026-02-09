import { Command } from "commander";

export interface CommandOption {
  flags: string;
  description?: string;
  defaultValue?: string | boolean | string[];
}

export interface BaseCommandParams<ARGS extends any[]> {
  name: string;
  description: string;
  options?: CommandOption[];
  action: (...args: ARGS) => Promise<void> | void;
}

export abstract class BaseCommand<ARGS extends any[] = any[]> {
  protected readonly command: Command;

  constructor(params: BaseCommandParams<ARGS>) {
    const { name, description, options = [], action } = params;

    this.command = new Command(name);
    this.command.description(description);

    for (const option of options) {
      this.command.option(option.flags, option.description, option.defaultValue);
    }

    this.command.action(action);
  }

  getCommand(): Command {
    return this.command;
  }
}
