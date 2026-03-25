import { EditAccountDTO } from "@/dtos/account/editAccount.dto.js";
import { ACCOUNT_CONSTANT } from "@/account.constant.js";
import type { AccountEntity } from "@/account.entity.js";
import { plainToClass } from "class-transformer";
import { validateSync } from "class-validator";
import inquirer from "inquirer";

interface InterfaceEditPromptOutput {
  algorithm: AccountEntity["algorithm"];
  encoding: AccountEntity["encoding"];
  counter: AccountEntity["counter"];
  issuer: AccountEntity["issuer"];
  secret: AccountEntity["secret"];
  period: AccountEntity["period"];
  digits: AccountEntity["digits"];
  name: AccountEntity["name"];
  type: AccountEntity["type"];
}

function validation(props: { [key: string]: string | number | undefined }) {
  const data = plainToClass<any, any>(EditAccountDTO, props);
  const result = validateSync(data, { skipMissingProperties: true });

  if (result.length > 0) {
    return Object.values(result[0]?.constraints || {})[0] ?? "Invalid value";
  }

  return true;
}

export async function editPrompt(account: AccountEntity): Promise<InterfaceEditPromptOutput> {
  try {
    const answers = await inquirer.prompt<InterfaceEditPromptOutput>([
      {
        prefix: "›",
        name: "name",
        type: "input",
        default: account.name,
        message: "🧾 Account name:",
        validate: (value) => validation({ name: value }),
      },
      {
        prefix: "›",
        type: "input",
        name: "issuer",
        default: account.issuer,
        message: "🏢 Issuer (service/provider):",
        validate: (value) => validation({ issuer: value }),
      },
      {
        prefix: "›",
        type: "input",
        name: "secret",
        default: account.secret,
        message: "🔑 Secret key:",
        validate: (value) => validation({ secret: value }),
      },
      {
        type: "number",
        name: "digits",
        message: "🔢 Token length (digits):",
        prefix: "›",
        default: account.digits,
        validate: (value) => validation({ digits: value }),
      },
      {
        type: "select",
        name: "algorithm",
        message: "⚙️  Hash algorithm:",
        prefix: "›",
        default: account.algorithm,
        choices: ACCOUNT_CONSTANT.ALGORITHMS,
      },
      {
        type: "select",
        name: "type",
        message: "🔐 OTP type:",
        prefix: "›",
        default: account.type,
        choices: ACCOUNT_CONSTANT.TYPES,
      },
      {
        type: "number",
        name: "period",
        message: "⏱️  Time step (seconds):",
        prefix: "›",
        default: account.period,
        when: ({ type }) => type === "TOTP",
        validate: (value) => validation({ period: value }),
      },
      {
        type: "number",
        name: "counter",
        message: "🔁 Counter value:",
        prefix: "›",
        default: account.counter,
        when: ({ type }) => type === "HOTP",
        validate: (value) => validation({ counter: value }),
      },
      {
        type: "select",
        name: "encoding",
        message: "🔤 Select encoding:",
        prefix: "›",
        default: account.encoding,
        choices: ACCOUNT_CONSTANT.ENCODINGS,
      },
    ]);

    return answers;
  } catch (error) {
    console.log("\n👋 Operation cancelled.");
    process.exit(0);
  }
}
