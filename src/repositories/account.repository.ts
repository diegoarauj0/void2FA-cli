import config from "@/config.js";
import { AccountEntity } from "@/entities/account.entity.js";
import { EncryptService, type IEncryptedData } from "@/service/encrypt.service.js";
import fs from "node:fs";
import path from "node:path";

class AccountRepository {
  private async readFile(): Promise<Array<AccountEntity>> {
    if (!fs.existsSync(config.accountsFile)) {
      await fs.promises.mkdir(path.parse(config.accountsFile).dir, { recursive: true });
      await fs.promises.writeFile(config.accountsFile, "[]", "utf-8");
    }

    const encryptedInText = await fs.promises.readFile(config.accountsFile, "utf-8");
    const encrypted = JSON.parse(encryptedInText) as IEncryptedData;

    if (encrypted.iv === undefined || encrypted.content === undefined || encrypted.tag === undefined) {
      return [];
    }

    const accounts = await EncryptService.decrypt(encrypted);

    return accounts.map((account) =>
      AccountEntity.create({
        algorithm: account.algorithm,
        customID: account.customID,
        encoding: account.encoding,
        OTPConfig: account.OTPConfig,
        issuer: account.issuer,
        digits: account.digits,
        id: account.id,
        secret: account.secret,
        name: account.name,
      })
    );
  }

  private async writeFile(accounts: Array<AccountEntity>): Promise<void> {
    if (!fs.existsSync(config.accountsFile)) {
      await fs.promises.mkdir(path.parse(config.accountsFile).dir, { recursive: true });
    }

    const encrypted = await EncryptService.encrypt(accounts);

    await fs.promises.writeFile(config.accountsFile, JSON.stringify(encrypted), "utf-8");
  }

  public async findAll(): Promise<Array<AccountEntity>> {
    return this.readFile();
  }

  public async find<K extends keyof AccountEntity>(field: K, value: AccountEntity[K]): Promise<AccountEntity | null> {
    const accounts = await this.readFile();
    return accounts.find((account) => account[field] === value) ?? null;
  }

  public async delete<K extends keyof AccountEntity>(field: K, value: AccountEntity[K]): Promise<void> {
    const accounts = await this.readFile();

    await this.writeFile(accounts.filter((account) => account[field] !== value));
  }

  public async save(account: AccountEntity): Promise<void> {
    const accounts = await this.readFile();
    const customID = account.customID?.trim();

    if (customID && customID.length > 0) {
      const customIdOwner = accounts.find((existing) => existing.customID === customID);
      if (customIdOwner && customIdOwner.id !== account.id) {
        throw new Error("Custom ID already in use.");
      }
    }

    const existingIndex = accounts.findIndex(({ id }) => id === account.id);

    if (existingIndex >= 0) {
      accounts[existingIndex] = account;
      await this.writeFile(accounts);
      return;
    }

    accounts.push(account);
    await this.writeFile(accounts);
  }
}

export const accountRepository = new AccountRepository();
