import { accountDefaults } from "@/app/constants/accountDefaults.js";
import type { IEditDTO } from "@/app/useCases/edit.useCase.js";
import type { AccountEntity, Algorithm, Encoding } from "@/domain/entities/account.entity.js";
import { commonValidators } from "@/infra/validators/account/common.validator.js";
import { AccountRepository } from "@/app/repositories/account.repository.js";
import validationAdapterUtil from "@/infra/utils/validationAdapter.util.js";
import inquirer from "inquirer";

type AccountType = "TOTP" | "HOTP";

type EditPromptAnswers = {
  name: string;
  issuer: string;
  secret: string;
  customID: string | undefined;
  digits: number;
  algorithm: Algorithm;
  encoding: Encoding;
  type: AccountType;
  period: number | undefined;
  counter: number | undefined;
};

export type EditPromptOutput = Omit<IEditDTO, "id">;

const ALGORITHM_CHOICES: Array<Algorithm> = ["SHA1", "SHA256", "SHA512"];
const TYPE_CHOICES: Array<AccountType> = ["TOTP", "HOTP"];
const ENCODING_CHOICES: Array<Encoding> = ["base32", "base64", "ascii", "hex"];

const requiredValidator = (validator: any) => (value: unknown) => validationAdapterUtil(validator.required(), value);

const defaultPeriod = (account: AccountEntity): number =>
  account.OTPConfig.type === "TOTP" ? account.OTPConfig.period : accountDefaults.period;

const defaultCounter = (account: AccountEntity): number =>
  account.OTPConfig.type === "HOTP" ? account.OTPConfig.counter : accountDefaults.counter;

const createCustomIdValidator =
  (account: AccountEntity) =>
  async (value: unknown): Promise<true | string> => {
    const customID = String(value ?? "").trim();

    if (customID.length === 0) return true;

    const formatValidation = validationAdapterUtil(commonValidators.customId, customID);
    if (formatValidation !== true) return formatValidation;

    const existing = await AccountRepository.find("customID", customID);
    if (existing && existing.id !== account.id) return "Custom ID already in use.";

    return true;
  };

const normalizeOutput = (answers: EditPromptAnswers): EditPromptOutput => {
  const customID = answers.customID?.trim();
  const output: EditPromptOutput = {
    name: answers.name,
    issuer: answers.issuer,
    secret: answers.secret,
    digits: answers.digits,
    algorithm: answers.algorithm,
    encoding: answers.encoding,
    type: answers.type,
  };

  if (answers.period !== undefined) output.period = answers.period;
  if (answers.counter !== undefined) output.counter = answers.counter;
  output.customID = customID && customID.length > 0 ? customID : undefined;

  return output;
};

export async function editPrompt(account: AccountEntity): Promise<EditPromptOutput> {
  const answers = await inquirer.prompt<EditPromptAnswers>([
    {
      type: "input",
      name: "name",
      message: "Account name:",
      default: account.name,
      validate: requiredValidator(commonValidators.name),
    },
    {
      type: "input",
      name: "issuer",
      message: "Account issuer:",
      default: account.issuer,
      validate: requiredValidator(commonValidators.issuer),
    },
    {
      type: "input",
      name: "secret",
      message: "Secret key:",
      default: account.secret,
      validate: requiredValidator(commonValidators.secret),
    },
    {
      type: "input",
      name: "customID",
      message: "Custom ID (optional):",
      default: account.customID,
      validate: createCustomIdValidator(account),
    },
    {
      type: "number",
      name: "digits",
      message: "Number of digits:",
      default: account.digits,
      validate: requiredValidator(commonValidators.digits),
    },
    {
      type: "select",
      name: "algorithm",
      message: "Algorithm:",
      default: account.algorithm,
      choices: ALGORITHM_CHOICES,
    },
    {
      type: "select",
      name: "encoding",
      message: "Encoding:",
      default: account.encoding,
      choices: ENCODING_CHOICES,
    },
    {
      type: "select",
      name: "type",
      message: "Account type:",
      default: account.OTPConfig.type,
      choices: TYPE_CHOICES,
    },
    {
      type: "number",
      name: "period",
      message: "Period:",
      default: defaultPeriod(account),
      when: ({ type }) => type === "TOTP",
      validate: requiredValidator(commonValidators.period),
    },
    {
      type: "number",
      name: "counter",
      message: "Counter:",
      default: defaultCounter(account),
      when: ({ type }) => type === "HOTP",
      validate: requiredValidator(commonValidators.counter),
    },
  ]);

  return normalizeOutput(answers);
}
