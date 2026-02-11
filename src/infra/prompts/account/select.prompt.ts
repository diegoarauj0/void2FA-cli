import { AccountRepository } from "@/app/repositories/account.repository.js";
import inquirer from "inquirer";

export async function selectPrompt(): Promise<string> {
  const accounts = await AccountRepository.findAll();

  if (accounts.length === 0) {
    throw new Error("No accounts available.");
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

  return account;
}
