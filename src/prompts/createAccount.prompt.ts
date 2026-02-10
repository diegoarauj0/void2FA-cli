import inquirer from "inquirer";
import { AccountService } from "@/service/account.service.js";
import validationAdapterUtil from "@/utils/validationAdapter.util.js";
import { accountValidators } from "@/validators/account.validators.js";
import type { Algorithm, Encoding } from "@/entities/account.entity.js";
import { accountRepository } from "@/repositories/account.repository.js";

type AccountType = "TOTP" | "HOTP";

const validate = (validator: any) => (value: unknown) => validationAdapterUtil(validator.required(), value);

export async function createAccountPrompt() {
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
  }>([
    {
      type: "input",
      name: "name",
      message: "Account name:",
      validate: validate(accountValidators.name),
    },
    {
      type: "input",
      name: "issuer",
      message: "Account issuer:",
      validate: validate(accountValidators.issuer),
    },
    {
      type: "input",
      name: "secret",
      message: "Secret key:",
      validate: validate(accountValidators.secret),
    },
    {
      type: "input",
      name: "customID",
      message: "Custom ID (optional):",
      validate: async (value: unknown) => {
        const customID = String(value ?? "").trim();
        if (customID.length === 0) return true;

        const formatValidation = validationAdapterUtil(accountValidators.customId, customID);
        if (formatValidation !== true) return formatValidation;

        const existing = await accountRepository.find("customID", customID);
        if (existing) return "Custom ID already in use.";

        return true;
      },
    },
    {
      type: "number",
      name: "digits",
      message: "Number of digits:",
      default: 6,
      validate: validate(accountValidators.digits),
    },
    {
      type: "select",
      name: "algorithm",
      message: "Algorithm:",
      choices: ["SHA1", "SHA256", "SHA512"],
    },
    {
      type: "select",
      name: "type",
      message: "Account type:",
      choices: ["TOTP", "HOTP"],
    },
    {
      type: "number",
      name: "period",
      message: "Period:",
      default: 30,
      when: ({ type }) => type === "TOTP",
      validate: validate(accountValidators.period),
    },
    {
      type: "number",
      name: "counter",
      message: "Counter:",
      default: 0,
      when: ({ type }) => type === "HOTP",
      validate: validate(accountValidators.counter),
    },
  ]);

  const encodingAnswer = await inquirer.prompt<{
    detect: boolean;
    encoding?: Encoding;
  }>([
    {
      type: "confirm",
      name: "detect",
      default: true,
      message: "Automatically detect encoding?",
    },
    {
      type: "select",
      name: "encoding",
      message: "Encoding:",
      when: ({ detect }) => !detect,
      choices: ["base32", "base64", "ascii", "hex"],
      default: AccountService.detectEncoding(answers.secret),
    },
  ]);

  const encoding = encodingAnswer.encoding ?? AccountService.detectEncoding(answers.secret);

  const customID = answers.customID?.trim();

  return {
    ...answers,
    customID: customID && customID.length > 0 ? customID : undefined,
    encoding,
  };
}
