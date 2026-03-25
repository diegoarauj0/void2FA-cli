import { CreateAccountDTO } from "@/dtos/account/createAccount.dto.js";
import { AccountService } from "@/services/account.service.js";
import { ACCOUNT_CONSTANT } from "@/account.constant.js";
import type { AccountEntity } from "@/account.entity.js";
import { plainToClass } from "class-transformer";
import { validateSync } from "class-validator";
import inquirer from "inquirer";

interface InterfaceCreatePromptOutput {
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
  const data = plainToClass<any, any>(CreateAccountDTO, props);
  const result = validateSync(data, { skipMissingProperties: true });

  if (result.length > 0) {
    return Object.values(result[0]?.constraints || {})[0] ?? "Invalid value";
  }

  return true;
}

export async function createPrompt(): Promise<InterfaceCreatePromptOutput> {
  try {
    const answers = await inquirer.prompt<InterfaceCreatePromptOutput & { detectEncoding: boolean }>([
      {
        type: "input",
        name: "name",
        message: "🧾 Account name:",
        prefix: "›",
        validate: (value) => validation({ name: value }),
      },
      {
        type: "input",
        name: "issuer",
        message: "🏢 Issuer (service/provider):",
        prefix: "›",
        validate: (value) => validation({ issuer: value }),
      },
      {
        type: "input",
        name: "secret",
        message: "🔑 Secret key:",
        prefix: "›",
        validate: (value) => validation({ secret: value }),
      },
      {
        type: "number",
        name: "digits",
        message: "🔢 Token length (digits):",
        prefix: "›",
        default: ACCOUNT_CONSTANT.DIGITS_DEFAULT,
        validate: (value) => validation({ digits: value }),
      },
      {
        type: "select",
        name: "algorithm",
        message: "⚙️  Hash algorithm:",
        prefix: "›",
        default: ACCOUNT_CONSTANT.ALGORITHM_DEFAULT,
        choices: ACCOUNT_CONSTANT.ALGORITHMS,
      },
      {
        type: "select",
        name: "type",
        message: "🔐 OTP type:",
        prefix: "›",
        choices: ACCOUNT_CONSTANT.TYPES,
        default: ACCOUNT_CONSTANT.TYPE_DEFAULT
      },
      {
        type: "number",
        name: "period",
        message: "⏱️  Time step (seconds):",
        prefix: "›",
        default: ACCOUNT_CONSTANT.PERIOD_DEFAULT,
        when: ({ type }) => type === "TOTP",
        validate: (value) => validation({ period: value }),
      },
      {
        type: "number",
        name: "counter",
        message: "🔁 Counter value:",
        prefix: "›",
        default: ACCOUNT_CONSTANT.COUNTER_DEFAULT,
        when: ({ type }) => type === "HOTP",
        validate: (value) => validation({ counter: value }),
      },
      {
        type: "confirm",
        name: "detectEncoding",
        message: "🧠 Auto-detect secret encoding?",
        default: true,
        prefix: "›",
      },
      {
        type: "select",
        name: "encoding",
        message: "🔤 Select encoding:",
        prefix: "›",
        when: ({ detectEncoding }) => !detectEncoding,
        choices: ACCOUNT_CONSTANT.ENCODINGS,
        default: ({ secret }: InterfaceCreatePromptOutput) => AccountService.detectEncoding(secret),
      },
    ]);

    return answers;
  } catch {
    console.log("\n👋 Operation cancelled.");
    process.exit(0);
  }
}
