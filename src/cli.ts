import { Command } from "commander";
import config from "./config.js";
import { PingCommand } from "./commands/ping.command.js";

const program = new Command();

program.name(config.name).description(config.description).version(config.version);

program.addCommand(new PingCommand().getCommand());

program.parse();
