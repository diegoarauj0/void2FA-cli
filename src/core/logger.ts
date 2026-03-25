import type { AccountEntity } from "@/account.entity.js";
import { Config } from "@/config.js";
import chalk from "chalk";
import { table } from "table";
import YAML from "yaml";

export const loggerWarning = (msg: string) => {
  console.log(chalk.yellow.bold("⚠"), chalk.yellow(msg));
};

export const loggerSuccess = (msg: string) => {
  console.log(chalk.green.bold("✔"), chalk.green(msg));
};

export const loggerError = (msg: string) => {
  console.log(chalk.red.bold("✖"), chalk.red(msg));
};

export const loggerInfo = (msg: string) => {
  console.log(chalk.blue.bold("ℹ"), chalk.blue(msg));
};

export const loggerDebug = (msg: string, ...meta: any[]) => {
  if (!Config.IS_DEV) return;

  console.log(chalk.magenta.bold("🐛 [DEBUG]"), chalk.magenta(msg));
  if (meta.length > 0) console.log(chalk.magenta("   >"), ...meta);
};

export const loggerAccount = (account: AccountEntity, showSecret = false) => {
  const lines: string[] = [];

  lines.push(chalk.cyan.bold("Account Details:"));
  lines.push(`ID: ${chalk.white(account.id)}`);
  lines.push(`Name: ${chalk.white(account.name)}`);
  lines.push(`Issuer: ${chalk.white(account.issuer)}`);
  lines.push(`Type: ${chalk.white(account.type)}`);
  lines.push(`Digits: ${chalk.white(account.digits.toString())}`);
  lines.push(`Period: ${chalk.white(account.period.toString())}`);
  lines.push(`Counter: ${chalk.white(account.counter.toString())}`);
  lines.push(`Algorithm: ${chalk.white(account.algorithm)}`);
  lines.push(`Encoding: ${chalk.white(account.encoding)}`);

  if (showSecret) {
    lines.push(`Secret: ${chalk.yellow(account.secret)}`);
  }

  console.log(lines.join("\n"));
};

export const loggerAccountJSON = (account: AccountEntity, showSecret = false) => {
  const output: any = {
    id: account.id,
    name: account.name,
    issuer: account.issuer,
    type: account.type,
    digits: account.digits,
    period: account.period,
    counter: account.counter,
    algorithm: account.algorithm,
    encoding: account.encoding,
  };

  if (showSecret) {
    output.secret = account.secret;
  }

  console.log(JSON.stringify(output, null, 2));
};

export const loggerAccountYAML = (account: AccountEntity, showSecret = false) => {
  const output: any = {
    id: account.id,
    name: account.name,
    issuer: account.issuer,
    type: account.type,
    digits: account.digits,
    period: account.period,
    counter: account.counter,
    algorithm: account.algorithm,
    encoding: account.encoding,
  };

  if (showSecret) {
    output.secret = account.secret;
  }

  console.log(YAML.stringify(output));
};

export const loggerAccountTable = (accounts: AccountEntity[], showSecret = false) => {
  const rows: any[] = [];

  const headers = ["ID", "Name", "Issuer", "Type", "Digits", "Period", "Counter", "Algorithm", "Encoding"];
  if (showSecret) headers.push("Secret");

  rows.push(headers);

  accounts.forEach((account) => {
    const { id, name, issuer, type, digits, period, counter, algorithm, encoding, secret } = account;

    const row = [id, name, issuer, type, digits.toString(), period.toString(), counter.toString(), algorithm, encoding];

    if (showSecret) row.push(secret);

    rows.push(row);
  });

  console.log(table(rows));
};

export const loggerAccountDebug = (account: AccountEntity) => {
  loggerDebug("Account raw object:", account);
};
