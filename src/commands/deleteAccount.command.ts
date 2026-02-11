import { accountRepository } from "@/repositories/account.repository.js";
import { BaseCommand } from "./base.command.js";
import { selectAccountPrompt } from "@/prompts/selectAccount.prompt.js";
import { loggerAccount, loggerError, loggerSuccess } from "@/utils/logger.util.js";
import findAccountUtil from "@/utils/findAccount.util.js";

export default new BaseCommand({
  description: "Delete a saved account",
  arguments: ["[id]"],
  name: "delete",
  examples: [
    { command: "delete 323e2825-5b92-4bc9-8d3c-57ba2a2a7774", comment: "Deletes an account using its ID" },
    { command: "delete diegoarauj0", comment: "Deletes an account using its name" },
    {
      command: "delete",
      comment: "// Opens the interactive prompt when no ID is provided",
    },
  ],
  action: async (id: string | undefined) => {
    const account = id === undefined ? await selectAccountPrompt() : await findAccountUtil(id);

    if (!account) {
      return loggerError(id === undefined ? "No accounts available." : "Account was not found.");
    }

    accountRepository.delete("id", account.id);

    loggerSuccess("Account deleted successfully");
    loggerAccount(account);
  },
});
