import { EditUseCase, type IEditDTO } from "@/account/useCases/edit.useCase.js";
import { BaseCommand } from "@/account/commands/base.command.js";
import { editPrompt } from "@/account/prompts/account/edit.prompt.js";
import { selectPrompt } from "@/account/prompts/account/select.prompt.js";
import { editValidator } from "@/validators/account/edit.validator.js";
import { AccountRepository } from "@/account/account.repository.js";
import { loggerAccount, loggerError, loggerSuccess } from "@/core/logger.js";

export const editCommand = new BaseCommand({
  arguments: ["[id]"],
  name: "edit",
  description: "Edit a saved account.",
  examples: [
    {
      command: "edit -n negativo diegoarauj0",
      comment: "// Change name diegoarauj0 to negativo_ddz",
    },
    {
      command: "edit -i Gitlab diegoarauj0",
      comment: "// Change issuer GitHub to Gitlab",
    },
    {
      command: "edit -i Gitlab -n negativo 323e2825-5b92-4bc9-8d3c-57ba2a2a7774",
      comment: "// Change issuer GitHub to Gitlab and diegoarauj0 to negativo.",
    },
  ],
  options: [
    { name: "-n, --name <name>", description: "Name" },
    { name: "-i, --issuer <issuer>", description: "Issuer" },
    { name: "-s, --secret <secret>", description: "Secret" },
    { name: "-a, --algorithm <algorithm>", description: "Algorithm: sha1, sha256, sha512" },
    { name: "-e, --encoding <encoding>", description: "Encoding: ascii, hex, base32, base64" },
    { name: "-p, --period <period>", description: "TOTP period" },
    { name: "-d, --digits <digits>", description: "Digits" },
    { name: "-c, --counter <counter>", description: "Initial counter (for HOTP)" },
    { name: "-t, --type <type>", description: "type: TOTP or HOTP" },
    { name: "-u, --customID <customID>", description: "customID" },
  ],
  action: async (id: string | undefined, options: Record<string, unknown>) => {
    const accountID = id === undefined ? await selectPrompt() : id;
    const hasFieldsToUpdate = Object.values(options).some((value) => value !== undefined);
    let data: Omit<IEditDTO, "id">;

    if (!hasFieldsToUpdate) {
      const currentAccount = await AccountRepository.findById(accountID);

      if (currentAccount === null) return loggerError("This account was not found.");

      data = await editPrompt(currentAccount);
    } else {
      const validatedData = editValidator({ ...options });

      if (typeof validatedData === "string") return loggerError(validatedData);

      data = validatedData;
    }

    const account = await EditUseCase.edit({ id: accountID, ...data });

    loggerSuccess("Account updated successfully!");
    return loggerAccount(account);
  },
});
