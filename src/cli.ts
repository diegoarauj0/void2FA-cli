import { Command } from "commander";
import createCommand from "@/commands/createAccount.command.js";
import pingCommand from "@/commands/ping.command.js";
import config from "@/config.js";

const program = new Command();

program.name(config.name).description(config.description).version(config.version);

program.addCommand(pingCommand);
program.addCommand(createCommand);

program.parse();
