import { Command } from "commander";
import pingCommand from "@/infra/commands/ping.command.js";
import config from "@/infra/config.js";
import chalk from "chalk";
import figlet from "figlet";
import { createCommand } from "./commands/account/create.command.js";
import { deleteCommand } from "./commands/account/delete.command.js";
import { editCommand } from "./commands/account/edit.command.js";
import { findCommand } from "./commands/account/find.command.js";
import { findAllCommand } from "./commands/account/findAll.command.js";
import { codeCommand } from "./commands/account/code.command.js";

const program = new Command();

const description = chalk.magentaBright(
  `${figlet.textSync(config.name, {
    font: "Slant",
    horizontalLayout: "default",
    verticalLayout: "default",
  })}\n${config.version} ${config.description}`
);

program.name(config.name).description(description).version(config.version);

program.addCommand(pingCommand);
program.addCommand(createCommand);
program.addCommand(deleteCommand);
program.addCommand(editCommand);
program.addCommand(findCommand);
program.addCommand(findAllCommand);
program.addCommand(codeCommand)

program.parse();
