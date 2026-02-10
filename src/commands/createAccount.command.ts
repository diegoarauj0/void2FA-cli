import crypto from "node:crypto";
import Joi from "joi";
import { AccountEntity, type Algorithm, type Encoding } from "@/entities/account.entity.js";
import { createAccountPrompt } from "@/prompts/createAccount.prompt.js";
import { accountRepository } from "@/repositories/account.repository.js";
import { AccountService } from "@/service/account.service.js";
import { loggerAccount, loggerError, loggerSuccess } from "../utils/logger.util.js";
import { accountValidators } from "@/validators/account.validators.js";
import { BaseCommand } from "./base.command.js";

const createSchema = Joi.object({
  issuer: accountValidators.issuer.required(),
  secret: accountValidators.secret.required(),
  name: accountValidators.name.required(),
  algorithm: accountValidators.algorithm,
  encoding: accountValidators.encoding,
  counter: accountValidators.counter,
  period: accountValidators.period,
  digits: accountValidators.digits,
  type: accountValidators.type,
});

type CreateAccountInput = {
  name: string;
  issuer: string;
  secret: string;
  algorithm?: Algorithm | undefined;
  encoding?: Encoding | undefined;
  counter?: number | undefined;
  period?: number | undefined;
  digits?: number | undefined;
  type?: "TOTP" | "HOTP";
  customID?: string | undefined;
};

const buildAccount = (data: CreateAccountInput) =>
  AccountEntity.create({
    id: crypto.randomUUID(),
    name: data.name,
    issuer: data.issuer,
    secret: data.secret,
    algorithm: data.algorithm || "SHA1",
    encoding: data.encoding || AccountService.detectEncoding(data.secret),
    digits: data.digits || 6,
    customID: data.customID,
    OTPConfig: {
      type: data.type || "TOTP",
      counter: (data.type || ("TOTP" as string)) === "HOTP" ? (data.counter as number) || 0 : (undefined as any),
      period: (data.type || ("TOTP" as string)) === "TOTP" ? (data.period as number) || 30 : (undefined as any),
    },
  });

const logAccountCreated = (account: AccountEntity) => {
  loggerSuccess("Registered Account");
  loggerAccount(account);
};

export default new BaseCommand({
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
  ],
  action: async (name: string, issuer: string, secret: string, options: any) => {
    if (name === undefined) {
      const data = await createAccountPrompt();
      const account = buildAccount(data);
      await accountRepository.save(account);
      logAccountCreated(account);
      return;
    }

    const result = createSchema.validate({ name, issuer, secret, ...options });

    if (result.error !== undefined) {
      return loggerError(result.error.message);
    }

    const account = buildAccount(result.value);
    await accountRepository.save(account);
    logAccountCreated(account);
  },
});
