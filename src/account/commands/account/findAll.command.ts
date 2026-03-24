import { BaseCommand } from "@/account/commands/base.command.js";
import { AccountRepository } from "@/account/account.repository.js";
import { loggerAccount, loggerSuccess } from "@/core/logger.js";
import chalk from "chalk";

export const findAllCommand = new BaseCommand({
  options: [{ name: "-s, --secret", description: "Display each account’s secret and current code" }],
  description: "List all saved accounts",
  name: "find-all",
  examples: [
    { command: "find-all", comment: "// Display each account’s" },
    { command: "find-all --secret", comment: "// Display each account’s secret and code" },
  ],
  action: async ({ secret }: { secret: boolean }) => {
    const accounts = await AccountRepository.findAll();

    loggerSuccess(`${accounts.length} saved accounts`);

    accounts.forEach((account, index) => {
      console.log(chalk.magenta(`index: ${index + 1}`));
      loggerAccount(account, secret);
      console.log("");
    });
  },
});
