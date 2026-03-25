import type { AccountEntity } from "@/account.entity.js";
import inquirer from "inquirer";

export async function selectPrompt(accounts: AccountEntity[]): Promise<AccountEntity | null> {
  try {
    if (accounts.length === 0) return null;

    const choices = accounts.map(({ name, issuer, id }) => ({
      name: `name: ${name} | issuer: ${issuer} | ID: ${id}`,
      short: name,
      value: id,
    }));

    const { account } = await inquirer.prompt<{ account: string }>([
      {
        type: "select",
        name: "account",
        message: "Select Account:",
        choices: choices,
      },
    ]);

    return accounts.filter(({ id }) => id === account)[0] ?? null;
  } catch {
    console.log("\n👋 Operation cancelled.");
    process.exit(0);
  }
}
