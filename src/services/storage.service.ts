import type { Account as InterfaceAccount } from "@/account.interface.js";
import { ACCOUNT_CONSTANT } from "@/account.constant.js";
import { EncryptService } from "./encrypt.service.js";
import { fileURLToPath } from "node:url";
import { Config } from "@/config.js";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import envPaths from "env-paths";
import path from "node:path";

interface InterfaceAccountsFile {
  version: number;
  accounts: InterfaceAccount[];
}

export class StorageService {
  private readonly encryptService = new EncryptService();
  private readonly filePath = StorageService.resolveFilePath();

  private static resolveFilePath(): string {
    const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

    const directory = Config.IS_DEV ? path.join(currentDirectory, "..", "..") : envPaths(Config.NAME).data;

    return path.join(directory, Config.ACCOUNTS_FILE);
  }

  private emptyFile(): InterfaceAccountsFile {
    return {
      version: Config.ACCOUNTS_VERSION,
      accounts: [],
    };
  }

  private isValidOption<T extends string>(value: unknown, options: readonly T[]): value is T {
    return typeof value === "string" && options.includes(value as T);
  }

  private normalizeAccount(value: unknown): InterfaceAccount {
    if (typeof value !== "object" || value === null) {
      throw new Error(`Invalid account entry in ${this.filePath}.`);
    }

    const account = value as Partial<InterfaceAccount>;

    if (typeof account.id !== "string" || account.id.length === 0) {
      throw new Error(`Account entry without id in ${this.filePath}.`);
    }

    if (typeof account.secret !== "string" || account.secret.length === 0) {
      throw new Error(`Account "${account.id}" has no secret in ${this.filePath}.`);
    }

    const constants = ACCOUNT_CONSTANT;

    return {
      id: account.id,
      secret: account.secret,

      algorithm: this.isValidOption(account.algorithm, constants.ALGORITHMS)
        ? account.algorithm
        : constants.ALGORITHM_DEFAULT,

      encoding: this.isValidOption(account.encoding, constants.ENCODINGS)
        ? account.encoding
        : constants.ENCODING_DEFAULT,

      type: this.isValidOption(account.type, constants.TYPES) ? account.type : constants.TYPE_DEFAULT,

      counter: account.counter ?? constants.COUNTER_DEFAULT,
      period: account.period ?? constants.PERIOD_DEFAULT,
      digits: account.digits ?? constants.DIGITS_DEFAULT,
      issuer: account.issuer ?? "unknown",
      name: account.name ?? "unknown",
    };
  }

  private normalizeFile(value: unknown): InterfaceAccountsFile {
    if (typeof value !== "object" || value === null) {
      throw new Error(`The storage file ${this.filePath} has an invalid structure.`);
    }

    const accountsFile = value as Partial<InterfaceAccountsFile>;
    const version = accountsFile.version ?? Config.ACCOUNTS_VERSION;

    if (version > Config.ACCOUNTS_VERSION) {
      throw new Error(
        `The storage file ${this.filePath} was created by a newer version of ${Config.NAME} (version ${version}). Please update it.`,
      );
    }

    if (!Array.isArray(accountsFile.accounts)) {
      throw new Error(`The storage file ${this.filePath} has no accounts list.`);
    }

    return {
      version: Config.ACCOUNTS_VERSION,
      accounts: accountsFile.accounts.map((account) => this.normalizeAccount(account)),
    };
  }

  private async read(): Promise<InterfaceAccountsFile> {
    if (!existsSync(this.filePath)) {
      return this.emptyFile();
    }

    const content = (await fs.readFile(this.filePath, "utf8")).trim();

    if (content.length === 0) {
      return this.emptyFile();
    }

    let decrypted: string;

    try {
      decrypted = await this.encryptService.decryptOrThrow(content);
    } catch {
      throw new Error(
        `Unable to decrypt ${this.filePath}. The encryption key may have changed or the file is corrupted.`,
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(decrypted);
    } catch {
      throw new Error(`The decrypted content of ${this.filePath} is not valid JSON.`);
    }

    return this.normalizeFile(parsed);
  }

  private async write(file: InterfaceAccountsFile): Promise<void> {
    const content = JSON.stringify(file, null, 2);
    const encrypted = await this.encryptService.encrypt(content);
    const temporaryPath = `${this.filePath}.tmp`;

    await fs.mkdir(path.dirname(this.filePath), {
      recursive: true,
    });

    await fs.writeFile(temporaryPath, encrypted, {
      encoding: "utf8",
      mode: 0o600,
    });

    await fs.rename(temporaryPath, this.filePath);
    await fs.chmod(this.filePath, 0o600);
  }

  public async find(): Promise<InterfaceAccount[]> {
    const { accounts } = await this.read();

    return accounts;
  }

  public async findOneById(id: string): Promise<InterfaceAccount | null> {
    const accounts = await this.find();

    return accounts.find((account) => account.id === id) ?? null;
  }

  public async search(query: string): Promise<InterfaceAccount[]> {
    const term = query.trim().toLowerCase();
    const accounts = await this.find();

    if (term.length === 0) {
      return accounts;
    }

    return accounts.filter((account) =>
      [account.id, account.name, account.issuer].some((value) => value.toLowerCase().includes(term)),
    );
  }

  public async save(account: InterfaceAccount): Promise<InterfaceAccount> {
    const file = await this.read();
    const existingIndex = file.accounts.findIndex((item) => item.id === account.id);

    if (existingIndex === -1) {
      file.accounts.push(account);
    } else {
      file.accounts[existingIndex] = account;
    }

    await this.write(file);

    return account;
  }

  public async delete(id: string): Promise<void> {
    const file = await this.read();
    const remainingAccounts = file.accounts.filter((account) => account.id !== id);

    if (remainingAccounts.length === file.accounts.length) return;

    await this.write({
      ...file,
      accounts: remainingAccounts,
    });
  }
}
