import { accountRepository } from "@/repositories/account.repository.js";
import inquirer from "inquirer";

export async function selectAccountPrompt() {
  const accounts = await accountRepository.findAll();

  if (accounts.length === 0) {
    return null;
  }

  const { account } = await inquirer.prompt<{ account: string }>([
    {
      type: "select",
      name: "account",
      message: "Select Account:",
      choices: accounts.map((item) => ({
        name: `name: ${item.name} | issuer: ${item.issuer}${item.customID ? ` | customID: ${item.customID}` : ""} | ID: ${item.id}`,
        value: item.id,
      })),
    },
  ]);

  return accounts.find((item) => item.id === account) ?? null;
}
