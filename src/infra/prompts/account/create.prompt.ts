import { accountDefaults } from "@/app/constants/accountDefaults.js";
import type { Algorithm, Encoding } from "@/domain/entities/account.entity.js";
import { commonValidators } from "@/infra/validators/account/common.validator.js";
import { AccountRepository } from "@/app/repositories/account.repository.js";
import { AccountService } from "@/app/service/account.service.js";
import validationAdapterUtil from "@/infra/utils/validationAdapter.util.js";
import inquirer from "inquirer";

type AccountType = "TOTP" | "HOTP";

type CreatePromptAnswers = {
  name: string;
  issuer: string;
  secret: string;
  customID: string | undefined;
  digits: number;
  algorithm: Algorithm;
  type: AccountType;
  period: number | undefined;
  counter: number | undefined;
  detectEncoding: boolean;
  encoding: Encoding | undefined;
};

export type CreatePromptOutput = {
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
};

const DEFAULT_DIGITS = accountDefaults.digits;
const DEFAULT_PERIOD = accountDefaults.period;
const DEFAULT_COUNTER = accountDefaults.counter;
const DEFAULT_ALGORITHM: Algorithm = accountDefaults.algorithm;

const ALGORITHM_CHOICES: Array<Algorithm> = ["SHA1", "SHA256", "SHA512"];
const TYPE_CHOICES: Array<AccountType> = ["TOTP", "HOTP"];
const ENCODING_CHOICES: Array<Encoding> = ["base32", "base64", "ascii", "hex"];

const requiredValidator = (validator: any) => (value: unknown) => validationAdapterUtil(validator.required(), value);

const validateCustomId = async (value: unknown): Promise<true | string> => {
  const customID = String(value ?? "").trim();

  if (customID.length === 0) return true;

  const formatValidation = validationAdapterUtil(commonValidators.customId, customID);
  if (formatValidation !== true) return formatValidation;

  const existing = await AccountRepository.find("customID", customID);
  if (existing) return "Custom ID already in use.";

  return true;
};

const normalizeOutput = (answers: CreatePromptAnswers): CreatePromptOutput => {
  const customID = answers.customID?.trim();
  const encoding = answers.encoding ?? AccountService.detectEncoding(answers.secret);
  const output: CreatePromptOutput = {
    name: answers.name,
    issuer: answers.issuer,
    secret: answers.secret,
    digits: answers.digits,
    algorithm: answers.algorithm,
    type: answers.type,
    encoding,
  };

  if (answers.period !== undefined) output.period = answers.period;
  if (answers.counter !== undefined) output.counter = answers.counter;
  if (customID && customID.length > 0) output.customID = customID;

  return output;
};

export async function createPrompt(): Promise<CreatePromptOutput> {
  const answers = await inquirer.prompt<CreatePromptAnswers>([
    {
      type: "input",
      name: "name",
      message: "Account name:",
      validate: requiredValidator(commonValidators.name),
    },
    {
      type: "input",
      name: "issuer",
      message: "Account issuer:",
      validate: requiredValidator(commonValidators.issuer),
    },
    {
      type: "input",
      name: "secret",
      message: "Secret key:",
      validate: requiredValidator(commonValidators.secret),
    },
    {
      type: "input",
      name: "customID",
      message: "Custom ID (optional):",
      validate: validateCustomId,
    },
    {
      type: "number",
      name: "digits",
      message: "Number of digits:",
      default: DEFAULT_DIGITS,
      validate: requiredValidator(commonValidators.digits),
    },
    {
      type: "select",
      name: "algorithm",
      message: "Algorithm:",
      default: DEFAULT_ALGORITHM,
      choices: ALGORITHM_CHOICES,
    },
    {
      type: "select",
      name: "type",
      message: "Account type:",
      choices: TYPE_CHOICES,
    },
    {
      type: "number",
      name: "period",
      message: "Period:",
      default: DEFAULT_PERIOD,
      when: ({ type }) => type === "TOTP",
      validate: requiredValidator(commonValidators.period),
    },
    {
      type: "number",
      name: "counter",
      message: "Counter:",
      default: DEFAULT_COUNTER,
      when: ({ type }) => type === "HOTP",
      validate: requiredValidator(commonValidators.counter),
    },
    {
      type: "confirm",
      name: "detectEncoding",
      default: true,
      message: "Automatically detect encoding?",
    },
    {
      type: "select",
      name: "encoding",
      message: "Encoding:",
      when: ({ detectEncoding }) => !detectEncoding,
      choices: ENCODING_CHOICES,
      default: ({ secret }: CreatePromptAnswers) => AccountService.detectEncoding(secret),
    },
  ]);

  return normalizeOutput(answers);
}
