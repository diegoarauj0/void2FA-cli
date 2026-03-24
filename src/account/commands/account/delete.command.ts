import { DeleteUseCase } from "@/account/useCases/delete.useCase.js";
import { BaseCommand } from "@/account/commands/base.command.js";
import { selectPrompt } from "@/account/prompts/account/select.prompt.js";
import { loggerAccount, loggerSuccess } from "@/core/logger.js";

export const deleteCommand = new BaseCommand({
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
  action: async (ID: string | undefined) => {
    const accountID = ID === undefined ? await selectPrompt() : ID;

    const account = await DeleteUseCase.delete({ ID: accountID });

    loggerSuccess("Account deleted successfully");
    loggerAccount(account);
  },
});
