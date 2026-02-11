import { loggerAccount, loggerError, loggerSuccess } from "@/infra/utils/logger.util.js";
import { createValidator } from "@/infra/validators/account/create.validator.js";
import { createPrompt } from "@/infra/prompts/account/create.prompt.js";
import type { AccountEntity } from "@/domain/entities/account.entity.js";
import { CreateUseCase } from "@/app/useCases/create.useCase.js";
import { BaseCommand } from "@/infra/commands/base.command.js";

const logAccountCreated = (account: AccountEntity) => {
  loggerSuccess("Registered Account");
  loggerAccount(account);
};

export const createCommand = new BaseCommand({
  name: "create",
  description: "Register a new account for authentication",
  arguments: ["[name]", "[issuer]", "[secret]"],
  examples: [
    {
      command: "create @diegoarauj0 Github MRUWKZ3PMFZGC5LKGAQCAIBA",
      comment: "// Creates a TOTP account using default settings",
    },
    {
      command: "create --period 30 --type TOTP Github diegoarauj0 MRUWKZ3PMFZGC5LKGAQCAIBA",
      comment: "// Sets the type to TOTP and period to 30 seconds",
    },
    {
      command: "create",
      comment: "// Opens the interactive prompt when no args are provided",
    },
  ],
  options: [
    { name: "-a, --algorithm <algorithm>", description: "Algorithm: sha1 (default), sha256, sha512" },
    { name: "-e, --encoding <encoding>", description: "Secret encoding: ascii, hex, base32, base64" },
    { name: "-p, --period <seconds>", description: "Time period for TOTP (default: 30)" },
    { name: "-d, --digits <count>", description: "Number of digits (default: 6)" },
    { name: "-c, --counter <value>", description: "Initial counter (for HOTP, default: 0)" },
    { name: "-t, --type <type>", description: "Account type: TOTP (default) or HOTP" },
    { name: "-i, --customID <customID>", description: "customID" },
  ],
  action: async (name: string, issuer: string, secret: string, options: any) => {
    if (name === undefined) {
      const data = await createPrompt();

      const account = await CreateUseCase.create(data);

      return logAccountCreated(account);
    }

    const data = createValidator({ name, issuer, secret, ...options });

    if (typeof data === "string") return loggerError(data);

    const account = await CreateUseCase.create(data);

    logAccountCreated(account);
  },
});
