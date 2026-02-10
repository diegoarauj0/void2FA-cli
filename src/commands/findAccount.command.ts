import { selectAccountPrompt } from "@/prompts/selectAccount.prompt.js";
import { accountRepository } from "@/repositories/account.repository.js";
import { loggerAccount, loggerError } from "@/utils/logger.util.js";
import { BaseCommand } from "./base.command.js";

export default new BaseCommand({
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
  action: async (id: string | undefined, { secret }: { secret: boolean }) => {
    const account =
      id === undefined
        ? await selectAccountPrompt()
        : (await accountRepository.find("id", id)) || (await accountRepository.find("customID", id));

    if (!account) {
      return loggerError(id === undefined ? "No accounts available." : "Account was not found.");
    }

    loggerAccount(account, secret);
  },
});
