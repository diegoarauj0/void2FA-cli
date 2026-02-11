import inquirer from "inquirer";
import validationAdapterUtil from "@/utils/validationAdapter.util.js";
import { accountValidators } from "@/validators/account.validators.js";
import { AccountEntity, type Algorithm, type Encoding } from "@/entities/account.entity.js";
import { accountRepository } from "@/repositories/account.repository.js";

type AccountType = "TOTP" | "HOTP";

const validate = (validator: any) => (value: unknown) => validationAdapterUtil(validator.required(), value);

export async function editAccountPrompt(account: AccountEntity) {
  const answers = await inquirer.prompt<{
    name: string;
    issuer: string;
    secret: string;
    customID?: string;
    digits: number;
    algorithm: Algorithm;
    type: AccountType;
    period?: number;
    counter?: number;
    encoding: Encoding;
  }>([
    {
      type: "input",
      name: "name",
      message: "Account name:",
      default: account.name,
      validate: validate(accountValidators.name),
    },
    {
      type: "input",
      name: "issuer",
      message: "Account issuer:",
      default: account.issuer,
      validate: validate(accountValidators.issuer),
    },
    {
      type: "input",
      name: "secret",
      message: "Secret key:",
      default: account.secret,
      validate: validate(accountValidators.secret),
    },
    {
      type: "input",
      name: "customID",
      message: "Custom ID (optional):",
      default: account.customID,
      validate: async (value: unknown) => {
        const customID = String(value ?? "").trim();
        if (customID.length === 0) return true;

        const formatValidation = validationAdapterUtil(accountValidators.customId, customID);
        if (formatValidation !== true) return formatValidation;

        const existing = await accountRepository.find("customID", customID);
        if (existing && existing.id !== account.id) return "Custom ID already in use.";

        return true;
      },
    },
    {
      type: "number",
      name: "digits",
      message: "Number of digits:",
      default: account.digits,
      validate: validate(accountValidators.digits),
    },
    {
      type: "select",
      name: "algorithm",
      message: "Algorithm:",
      default: account.algorithm,
      choices: ["SHA1", "SHA256", "SHA512"],
    },
    {
      type: "select",
      name: "encoding",
      message: "Encoding:",
      choices: ["base32", "base64", "ascii", "hex"],
      default: account.encoding,
    },
    {
      type: "select",
      name: "type",
      message: "Account type:",
      default: account.OTPConfig.type,
      choices: ["TOTP", "HOTP"],
    },
    {
      type: "number",
      name: "period",
      message: "Period:",
      default: (account.OTPConfig as any).period || 30,
      when: ({ type }) => type === "TOTP",
      validate: validate(accountValidators.period),
    },
    {
      type: "number",
      name: "counter",
      message: "Counter:",
      default: (account.OTPConfig as any).counter || 0,
      when: ({ type }) => type === "HOTP",
      validate: validate(accountValidators.counter),
    },
  ]);

  const customID = answers.customID?.trim();

  return AccountEntity.create({
    id: account.id,
    ...answers,
    customID: customID,
    encoding: "ascii",
    OTPConfig: {
      counter: answers.counter as number,
      period: answers.period as number,
      type: answers.type,
    },
  });
}
