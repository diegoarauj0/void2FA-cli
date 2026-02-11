import { selectAccountPrompt } from "@/prompts/selectAccount.prompt.js";
import { BaseCommand } from "./base.command.js";
import { loggerAccount, loggerError, loggerSuccess } from "@/utils/logger.util.js";
import { editAccountPrompt } from "@/prompts/editAccount.prompt.js";
import { type Algorithm, type Encoding } from "@/entities/account.entity.js";
import { accountRepository } from "@/repositories/account.repository.js";
import Joi from "joi";
import { accountValidators } from "@/validators/account.validators.js";
import findAccountUtil from "@/utils/findAccount.util.js";

const editSchema = Joi.object<{
  issuer?: string;
  secret?: string;
  name?: string;
  algorithm?: Algorithm;
  encoding?: Encoding;
  counter?: number;
  period?: number;
  digits?: number;
  type?: "TOTP" | "HOTP";
}>({
  issuer: accountValidators.issuer,
  secret: accountValidators.secret,
  name: accountValidators.name,
  algorithm: accountValidators.algorithm,
  encoding: accountValidators.encoding,
  counter: accountValidators.counter,
  period: accountValidators.period,
  digits: accountValidators.digits,
  type: accountValidators.type,
});

export default new BaseCommand({
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
  ],
  action: async (id: string | undefined, options) => {
    if (id === undefined) {
      const account = await selectAccountPrompt();

      if (account === null) {
        return loggerError("No accounts available.");
      }

      const newAccount = await editAccountPrompt(account);

      await accountRepository.save(newAccount);

      loggerSuccess("Account updated successfully!");
      return loggerAccount(newAccount);
    }

    const data = await editSchema.validateAsync({ ...options });

    const account = await findAccountUtil(id);

    if (!account) {
      return loggerError("This account was not found.");
    }

    account.name = data.name === undefined ? account.name : data.name;
    account.issuer = data.issuer === undefined ? account.issuer : data.issuer;
    account.secret = data.secret === undefined ? account.secret : data.secret;
    account.algorithm = data.algorithm === undefined ? account.algorithm : data.algorithm;
    account.encoding = data.encoding === undefined ? account.encoding : data.encoding;
    account.digits = data.digits === undefined ? account.digits : data.digits;
    account.OTPConfig.type = data.type === undefined ? account.OTPConfig.type : data.type;
    (account.OTPConfig as any).period = data.period === undefined ? (account.OTPConfig as any).period : data.period;
    (account.OTPConfig as any).counter = data.counter === undefined ? (account.OTPConfig as any).counter : data.counter;

    await accountRepository.save(account);

    loggerSuccess("Account updated successfully!");
    loggerAccount(account);
  },
});
