import chalk from "chalk";
import type { AccountEntity } from "@/entities/account.entity.js";
import config from "@/config.js";

export const loggerSuccess = (msg: string) => console.log(chalk.green("✔"), msg);

export const loggerError = (msg: string) => console.log(chalk.red("✖"), msg);

export const loggerAccount = (account: AccountEntity) => {
  const label = (text: string) => chalk.magenta(text + ":");
  const value = (text: string | number) => chalk.green(text + ",")

  console.log(chalk.magenta("About account:"));
  console.log(`  ${label("id")} ${value(account.id)}`);
  console.log(`  ${label("name")} ${value(account.name)}`);
  console.log(`  ${label("issuer")} ${value(account.issuer)}`);
  if (account.customID) {
    console.log(`  ${label("customID")} ${value(account.customID)}`);
  }
  console.log(`  ${label("type")} ${value(account.OTPConfig.type)}`);
  if (account.OTPConfig.type === "TOTP") {
    console.log(`  ${label("period")} ${value(account.OTPConfig.period)}`);
  } else {
    console.log(`  ${label("counter")} ${value(account.OTPConfig.counter)}`);
  }
  console.log(`  ${label("digits")} ${value(account.digits)}`);
  console.log(`  ${label("algorithm")} ${value(account.algorithm)}`);
  console.log(`  ${label("encoding")} ${value(account.encoding)}`);
  if (config.debug) {
    console.log(`  ${label("secret")} ${value(account.secret)}`);
  }
};
