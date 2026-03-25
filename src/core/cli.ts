import { dataSource } from "@/database/dataSource.js";
import { commandHandler } from "./commandHandler.js";
import commands from "@/commands/commands.js";
import { Config } from "@/config.js";
import { Command } from "commander";
import figlet from "figlet";
import chalk from "chalk";

(async () => {
  await dataSource.initialize();

  const program = new Command();

  const description = chalk.magentaBright(
    `${figlet.textSync(Config.NAME, {
      font: "Slant",
      horizontalLayout: "default",
      verticalLayout: "default",
    })}\n${Config.VERSION} ${Config.DESCRIPTION}`,
  );

  program.name(Config.NAME).description(description).version(Config.VERSION);

  for (const command of commands) {
    commandHandler(command, program);
  }

  program.parse();
})();
