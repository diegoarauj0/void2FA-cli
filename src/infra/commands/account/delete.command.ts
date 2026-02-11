import { DeleteUseCase } from "@/app/useCases/delete.useCase.js";
import { BaseCommand } from "@/infra/commands/base.command.js";
import { selectPrompt } from "@/infra/prompts/account/select.prompt.js";
import { loggerAccount, loggerSuccess } from "@/infra/utils/logger.util.js";

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
