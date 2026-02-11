import { Command } from "commander";
import createAccountCommand from "@/commands/createAccount.command.js";
import findAccountCommand from "@/commands/findAccount.command.js";
import pingCommand from "@/commands/ping.command.js";
import config from "@/config.js";
import chalk from "chalk";
import figlet from "figlet";
import deleteAccountCommand from "./commands/deleteAccount.command.js";
import findAllAccountsCommand from "./commands/findAllAccounts.command.js";

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
program.addCommand(createAccountCommand);
program.addCommand(findAccountCommand);
program.addCommand(deleteAccountCommand)
program.addCommand(findAllAccountsCommand)

program.parse();
