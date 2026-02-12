import { AccountRepository } from "@/app/repositories/account.repository.js";
import { loggerAccount, loggerError } from "@/infra/utils/logger.util.js";
import { selectPrompt } from "@/infra/prompts/account/select.prompt.js";
import { BaseCommand } from "@/infra/commands/base.command.js";

export const findCommand = new BaseCommand({
  options: [{ name: "-s, --secret", description: "Display the account’s secret" }],
  description: "Show detailed information about a specific account",
  arguments: ["[id]"],
  name: "find",
  examples: [
    {
      command: "find 323e2825-5b92-4bc9-8d3c-57ba2a2a7774",
      comment: "// Find an account by its ID",
    },
    {
      command: "find diegoarauj0",
      comment: "// Find an account by its customID",
    },
    {
      command: "find --secret 323e2825-5b92-4bc9-8d3c-57ba2a2a7774",
      comment: "// Show account details including the secret (use with caution)",
    },
    {
      command: "find",
      comment: "// Opens the interactive prompt when no ID is provided",
    },
  ],
  action: async (ID: string | undefined, { secret }: { secret: boolean }) => {
    const accountID = ID === undefined ? await selectPrompt() : ID;
    const account = await AccountRepository.findById(accountID);

    if (account === null) return loggerError("Account was not found.");

    loggerAccount(account, secret);
  },
});
